<?php

namespace App\ExternalDataSource;

use App\Enums\AttributeSetOptionValuation;
use App\ExternalDataSource\Dto\AttributeSetDto;
use App\ExternalDataSource\Dto\AttributeSetOptionDto;
use App\ExternalDataSource\Dto\EquipmentDto;
use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\ExternalDataSource\Dto\HandlingUnitItemDto;
use App\ExternalDataSource\Dto\InspectionLotDto;
use App\ExternalDataSource\Dto\InspectionOperationCharacteristicDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationDto;
use App\ExternalDataSource\Dto\UserDto;
use App\ExternalDataSource\Dto\UserGroupDto;
use App\Models\InspectionLot;
use App\Models\Plant;
use Exception;

class BenacchioExternalDataSource extends SapApiExternalDataSource
{
    function handlingUnitDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata/sap/ZA_HANDLINGUNIT_CDS/ZA_HANDLINGUNIT";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$expand' => 'to_Item',
            '$format' => 'json',
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));
        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results'])) {
            return false;
        }

        $dtos = [];
        foreach ($res['d']['results'] as $handlingUnit) {
            $dto = new HandlingUnitDto(
                custom_id: $handlingUnit['HandlingUnitExternalID'],
                handling_unit_item_id_custom: $handlingUnit['PackagingMaterial'],
                is_complete: ($handlingUnit['UserStatus'] ?? null) === 'PN',
                storage_location_id_custom: $handlingUnit['StorageLocation'],
                plant_id_custom: $handlingUnit['Plant'],
            );

            foreach ($handlingUnit['to_Item']['results'] as $item) {
                if ($item['Material']) {
                    $dto->items[] = new HandlingUnitItemDto(
                        item_id_custom: $item['Material'],
                        quantity: $item['StockType'] != 'S' ? $item['HandlingUnitQuantity'] : 0, // If stock is not available put qty to 0
                        batch: $item['Batch'],
                    );
                }
            }

            $dtos[] = $dto;
        }

        return $dtos;
    }

    public function storageBinDtos(int $skip, int $take): array|false
    {
        return false; // Disabled for benacchio
    }


    /**
     * @param int $skip
     * @param int $take
     * @return ProdInspectionOperationDto[]|false
     */
    public function prodInspectionOperationDtos(int $skip, int $take): array|false
    {
        $inspectionLots = InspectionLot::select('custom_id')
            ->skip($skip)
            ->take($take)
            ->get();

        if (!$inspectionLots || !count($inspectionLots))
            return false;

        $conditions = [];

        foreach ($inspectionLots as $inspectionLot) {
            $conditions[] = "InspectionLot eq '" . $inspectionLot->custom_id . "'";
        }
        $conditionString = implode(" or ", $conditions);

        $baseUrl = "sap/opu/odata/sap/API_INSPECTIONLOT_SRV/A_InspectionCharacteristic";
        $queryParams = [
            '$format' => 'json',
            '$filter' => $conditionString,
            '$select' => '*',
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res->json()['d']) || !isset($res->json()['d']['results']))
            throw new Exception("Failed to load: \n" . json_encode($res));

        if (!count($res->json()['d']['results'])) {
            return false;
        }

        $dtos = [];

        $inspectionLots = collect($res->json()['d']['results'])->groupBy(['InspectionLot', function ($item) {
            return $item['InspPlanOperationInternalID'];
        }], preserveKeys: true);

        foreach ($inspectionLots as $inpsectionLotKey => $inspectionLotOperations) {
            foreach ($inspectionLotOperations as $operationKey => $inspectionOperation) {
                $characteristics = [];
                foreach ($inspectionOperation as $inspectionOperationCharacteristic) {
                    $characteristics[] = new InspectionOperationCharacteristicDto(
                        pos: $inspectionOperationCharacteristic['InspectionCharacteristic'],
                        name: $inspectionOperationCharacteristic['InspectionSpecificationText'] ?? null,
                        is_quantitative: $inspectionOperationCharacteristic['InspSpecIsQuantitative'] ?? true,
                        value_target: $inspectionOperationCharacteristic['InspSpecHasTargetValue'] == 'X' ? $inspectionOperationCharacteristic['InspSpecTargetValue'] : null,
                        value_lower_limit: $inspectionOperationCharacteristic['InspSpecHasLowerLimit'] == 'X' ? $inspectionOperationCharacteristic['InspSpecLowerLimit'] : ($inspectionOperationCharacteristic['InspSpecHasTargetValue'] == 'X' ? $inspectionOperationCharacteristic['InspSpecTargetValue'] : null),
                        value_upper_limit: $inspectionOperationCharacteristic['InspSpecHasUpperLimit'] == 'X' ? $inspectionOperationCharacteristic['InspSpecUpperLimit'] : ($inspectionOperationCharacteristic['InspSpecHasTargetValue'] == 'X' ? $inspectionOperationCharacteristic['InspSpecTargetValue'] : null),
                        value_lower_limit_plausible: $inspectionOperationCharacteristic['InspSpecHasLowerLimitPlausible'] == 'X' ? $inspectionOperationCharacteristic['InspSpecLowerLimitPlausible'] : null,
                        value_upper_limit_plausible: $inspectionOperationCharacteristic['InspSpecHasUpperLimitPlausible'] == 'X' ? $inspectionOperationCharacteristic['InspSpecUpperLimitPlausible'] : null,
                        decimals: $inspectionOperationCharacteristic['InspSpecDecimalPlaces'] ?? 1,
                        unit_of_measure_id_custom_value: $inspectionOperationCharacteristic['InspectionSpecificationUnit'] ?? null,
                        sample_size: $inspectionOperationCharacteristic['InspCharacteristicSampleSize'] ?? 1,
                        unit_of_measure_id_custom_sample: $inspectionOperationCharacteristic['InspCharacteristicSampleUnit'] ?? null,
                        attribute_set_id_custom: $inspectionOperationCharacteristic['SelectedCodeSet'] ?? null,
                        plant_id_custom: $inspectionOperationCharacteristic['SelectedCodeSetPlant'] ?? null,
                        user_group_id_custom: $inspectionOperationCharacteristic['InspectorQualification'] ?? null,
                        importance_code_id_custom: $inspectionOperationCharacteristic['InspSpecImportanceCode'] ?? null,
//                        valuation_rule_id_custom: $inspectionOperationCharacteristic['InspSampleValuationRule'] ?? null,
                    );
                }

                $dtos[] = new ProdInspectionOperationDto(
                    inspection_lot: $inpsectionLotKey,
                    internal_id: $operationKey,
                    inspectionOperationCharacteristicDtos: $characteristics,
                );
            }
        }

        return $dtos;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionLotDto[]|false
     * @throws Exception
     */
    public function inspectionLotDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata/sap/API_INSPECTIONLOT_SRV/A_InspectionLot";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$format' => 'json',
            '$filter' => "ManufacturingOrder ne ''",
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res->json()['d']['results']))
            throw new Exception("Failed to load: \n" . json_encode($res));

        if (!count($res->json()['d']['results'])) {
            return false;
        }

        $dtos = [];

        foreach ($res->json()['d']['results'] as $inspectionLot) {
            $dtos[] = new InspectionLotDto(
                custom_id: $inspectionLot['InspectionLot'],
                prod_order_id_custom: strlen($inspectionLot['ManufacturingOrder']) > 0 ? $inspectionLot['ManufacturingOrder'] : null,
                item_id_custom: strlen($inspectionLot['Material']) > 0 ? $inspectionLot['Material'] : null,
                plant_id_custom: strlen($inspectionLot['Plant']) > 0 ? $inspectionLot['Plant'] : null,
            );
        }

        return $dtos;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return AttributeSetDto[]|false
     * @throws Exception
     */
    public function attributeSetDtos(int $skip, int $take): array|false
    {
        if ($skip)
            return false;

        $conditions = [];

        foreach (Plant::all() as $plant) {
            $conditions[] = "SelectedCodeSetPlant eq '" . $plant->custom_id . "'";
        }
        $conditionString = implode(" or ", $conditions);

        $baseUrl = "sap/opu/odata/sap/API_CHARCATTRIBUTECATALOG_SRV/A_CharcAttribSeldSetCode";
        $queryParams = [
            '$format' => 'json',
            '$filter' => $conditionString,
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res->json()['d']['results']))
            throw new Exception("Failed to load: \n" . json_encode($res));

        if (!count($res->json()['d']['results'])) {
            return false;
        }

        $plantAttributeSet = collect($res->json()['d']['results'])->groupBy(['SelectedCodeSetPlant', function ($item) {
            return $item['SelectedCodeSet'];
        }], preserveKeys: true);

        $dtos = [];
        foreach ($plantAttributeSet as $plantKey => $attributeSet) {
            foreach ($attributeSet as $attributeSetKey => $attributeSetOptions) {
                $optionDtos = [];
                $internalId = null;
                foreach ($attributeSetOptions as $attributeSetOption) {
                    $internalId = $attributeSetOption['CharacteristicAttributeCodeGrp'];
                    $optionDtos[] = new AttributeSetOptionDto(
                        custom_id: $attributeSetOption['CharacteristicAttributeCode'],
                        valuation: $this->getAttributeSetOptionValuationForKey($attributeSetOption['CharcAttributeValuation']),
                    );
                }

                $dtos[] = new AttributeSetDto(
                    custom_id: $attributeSetKey,
                    internal_id: $internalId,
                    plant_id_custom: strlen($plantKey) > 0 ? $plantKey : null,
                    attributeSetOptions: $optionDtos,
                );
            }
        }

        return $dtos;
    }

    private function getAttributeSetOptionValuationForKey(mixed $key): AttributeSetOptionValuation
    {
        return match ($key) {
            'A' => AttributeSetOptionValuation::ACCEPT,
            'R' => AttributeSetOptionValuation::REJECT,
            default => AttributeSetOptionValuation::SKIP,
        };
    }

    public function userDtos(int $skip, int $take): array|false
    {
        if ($skip)
            return false;

        $now = now()->toDateTimeLocalString();

        $baseUrl = "sap/opu/odata/SAP/ZAPI_CID_SRV/CIDSet";
        $queryParams = [
            '$filter' => "BeginDate lt datetime'$now' and EndDate ge datetime'$now'",
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));
        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results'])) {
            return false;
        }

        $dtos = [];
        foreach ($res['d']['results'] as $user) {
            $userGroups = null;

            if ($user['Qualification']) {
                $userGroups = [];
                $userGroups[] = new UserGroupDto(custom_id: $user['Qualification']);

                if (collect(['CR', 'CQJ', 'CQS'])->contains($user['Qualification'])) {
                    $userGroups[] = new UserGroupDto(custom_id: 'OP');
                }
                if (collect(['CQJ', 'CQS'])->contains($user['Qualification'])) {
                    $userGroups[] = new UserGroupDto(custom_id: 'CR');
                }

                if (collect(['CQS'])->contains($user['Qualification'])) {
                    $userGroups[] = new UserGroupDto(custom_id: 'CQJ');
                }
            }

            $dto = new UserDto(
                custom_id: $user['Cid'],
                name: $user['Name'],
                is_active: $user['Occupation'] == '3', // 0 -> dip.dimiss., 1 -> in pensione, 2 -> pensionato, 3 -> Attivo
                userGroupDtos: $userGroups,
            );

            $dtos[] = $dto;
        }

        return $dtos;
    }


    /**
     * @param int $skip
     * @param int $take
     * @param string|null $serialFilter
     * @param string|null $itemFilter
     * @return EquipmentDto[]|false
     * @throws Exception
     */
    public function equipmentDtos(int $skip, int $take, ?string $serialFilter = null, ?string $itemFilter = null): array|false
    {
        //Unlike FNA import all equipments always

        $baseUrl = "sap/opu/odata/sap/API_EQUIPMENT/Equipment";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$format' => 'json',
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        if ($serialFilter || $itemFilter) {
            $filter = [];
            if ($serialFilter) {
                $filter[] = "SerialNumber eq '" . $serialFilter . "'";
            }
            if ($itemFilter) {
                $filter[] = "Material eq '" . $itemFilter . "'";
            }
            $queryParams['$filter'] = implode(' and ', $filter);
        }

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']))
            throw new Exception("Failed to load: \n" . json_encode($res));

        if (!count($res['d']['results'])) {
            return false;
        }

        $dtos = [];

        foreach ($res['d']['results'] as $equipment) {
            $dtos[] = new EquipmentDto(
                custom_id: $equipment['Equipment'],
                item_id_custom: strlen($equipment['Material']) ? $equipment['Material'] : null,
                name: strlen($equipment['EquipmentName']) ? $equipment['EquipmentName'] : null,
                serial: strlen($equipment['SerialNumber']) ? $equipment['SerialNumber'] : null,
                validity_end: $this->parseDateTimeString($equipment['ValidityEndDate'], $equipment['ValidityEndTime']),
            );
        }

        return $dtos;
    }
}