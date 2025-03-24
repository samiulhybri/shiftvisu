<?php

namespace App\ExternalDataSource;

use App\Contracts\ExternalDataSource;
use App\Enums\ComponentPreparationState;
use App\Enums\ProdInspectionOperationFrequency;
use App\Enums\ProdInspectionOperationResourceType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
use App\ExternalDataSource\Dto\AttributeSetDto;
use App\ExternalDataSource\Dto\EquipmentDto;
use App\ExternalDataSource\Dto\InspectionLotDto;
use App\ExternalDataSource\Dto\InspectionSpecificationDto;
use App\ExternalDataSource\Dto\ItemStateDto;
use App\ExternalDataSource\Dto\BomDto;
use App\ExternalDataSource\Dto\CallOffDto;
use App\ExternalDataSource\Dto\CapacityDto;
use App\ExternalDataSource\Dto\ClassificationDto;
use App\ExternalDataSource\Dto\CostCenterDto;
use App\ExternalDataSource\Dto\CustomerDto;
use App\ExternalDataSource\Dto\DepartmentDto;
use App\ExternalDataSource\Dto\HallDto;
use App\ExternalDataSource\Dto\HandlingUnitDto;
use App\ExternalDataSource\Dto\HandlingUnitItemDto;
use App\ExternalDataSource\Dto\ItemDto;
use App\ExternalDataSource\Dto\ItemGroupDto;
use App\ExternalDataSource\Dto\ItemPlantDto;
use App\ExternalDataSource\Dto\MachineDto;
use App\ExternalDataSource\Dto\MachineGroupDto;
use App\ExternalDataSource\Dto\MachineProdOrderPosOperationTimeDto;
use App\ExternalDataSource\Dto\MachineStateDto;
use App\ExternalDataSource\Dto\MachineStateGroupDto;
use App\ExternalDataSource\Dto\MachineStateTimeDto;
use App\ExternalDataSource\Dto\MachineUserTimeDto;
use App\ExternalDataSource\Dto\OffDayDto;
use App\ExternalDataSource\Dto\OperationPlanDto;
use App\ExternalDataSource\Dto\PackagingInstructionDto;
use App\ExternalDataSource\Dto\PackagingInstructionPosDto;
use App\ExternalDataSource\Dto\PermissionDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationDto;
use App\ExternalDataSource\Dto\ProdInspectionOperationResourceDto;
use App\ExternalDataSource\Dto\ProdOrderDto;
use App\ExternalDataSource\Dto\ProdOrderPosBomPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationDto;
use App\ExternalDataSource\Dto\ProdOrderPosOperationResourceDto;
use App\ExternalDataSource\Dto\ProductionSupplyAreaDto;
use App\ExternalDataSource\Dto\ResourceGroupDto;
use App\ExternalDataSource\Dto\SalesOrderDto;
use App\ExternalDataSource\Dto\SettingsDto;
use App\ExternalDataSource\Dto\ShiftDto;
use App\ExternalDataSource\Dto\ShiftModelDto;
use App\ExternalDataSource\Dto\StockDto;
use App\ExternalDataSource\Dto\StorageBinDto;
use App\ExternalDataSource\Dto\StorageTypeDto;
use App\ExternalDataSource\Dto\SupplierDto;
use App\ExternalDataSource\Dto\ToolDto;
use App\ExternalDataSource\Dto\TpmGroupDto;
use App\ExternalDataSource\Dto\TpmSubGroupDto;
use App\ExternalDataSource\Dto\UnitOfMeasureConversionDto;
use App\ExternalDataSource\Dto\UserDto;
use App\ExternalDataSource\Dto\UserGroupDto;
use App\ExternalDataSource\Dto\WarehouseDto;
use App\Models\Equipment;
use App\Services\ImportFromBTPService;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;

class SapApiExternalDataSource implements ExternalDataSource
{

    protected ImportFromBTPService $apiService;

    public function __construct(ImportFromBTPService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function parseDateTime(string $date, ?string $time = null): Carbon
    {
        // $date is of form "/Date(1470268800000)/", time is of form "PT00H00M00S"
        $date = Carbon::createFromTimestampMs(substr($date, 6, -2));

        if (!$time) {
            return $date;
        }

        return $date
            ->addHours(intval(substr($time, 2, 2)))
            ->addMinutes(intval(substr($time, 5, 2)))
            ->addSeconds(intval(substr($time, 8, 2)));
    }

    public function parseDateTimeString(string $date, ?string $time = null): string
    {
        return $this->parseDateTime($date, $time)->toDateTimeString();
    }

    private function parseTime(string $time): string
    {
        return (new Carbon())
            ->hour(intval(substr($time, 2, 2)))
            ->minute(intval(substr($time, 5, 2)))
            ->second(intval(substr($time, 8, 2)))
            ->toTimeString();
    }

    private function getMultipleOfSecondsFromUnit(?string $unit): int
    {
        return match ($unit) {
            'S' => 1,
            'MIN' => 60,
            'H' => 60 * 60,
            'DAY' => 60 * 60 * 24,
            default => 0
        };
    }

    private function getDescription(array $descriptions): array|null
    {
        $description = array_values(array_filter($descriptions, function ($desc) {
            return $desc['Language'] === 'IT';
        }));
        if (!count($description)) {
            $description = array_values(array_filter($descriptions, function ($desc) {
                return $desc['Language'] === 'EN';
            }));
        }
        if (!count($description)) {
            $description = $descriptions;
        }
        if (!count($description)) {
            return null;
        }
        return $description[0];
    }

    public function halls(): Collection
    {
        return collect([]);
    }

    private function getDefaultPackagingInstructions(array $items): array
    {
        $baseUrl = "sap/opu/odata/SAP/ZAPI_PACK_INSTR_ALTERNATIVES_SRV/AlternativesSet";
        $conditions = [];
        foreach ($items as $item) {
            $conditions[] = "Material eq '" . $item . "'";
        }
        $conditionString = implode(" or ", $conditions);
        $queryParams = [
            '$format' => 'json',
            '$filter' => $conditionString,
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return [];

        $packagingInstructions = [];

        foreach ($res['d']['results'] as $packagingInstruction) {
            $item = $packagingInstruction['Material'];
            $packagingInstructions[$item] = [
                "packaging_instruction_id_custom" => strlen($packagingInstruction['PobjidDef']) ? $packagingInstruction['PobjidDef'] : null,
                "packaging_instruction_id_1_custom" => strlen($packagingInstruction['Pobjid1']) ? $packagingInstruction['Pobjid1'] : null,
                "packaging_instruction_id_2_custom" => strlen($packagingInstruction['Pobjid2']) ? $packagingInstruction['Pobjid2'] : null,
                "packaging_instruction_id_3_custom" => strlen($packagingInstruction['Pobjid3']) ? $packagingInstruction['Pobjid3'] : null,
                "packaging_instruction_id_4_custom" => strlen($packagingInstruction['Pobjid4']) ? $packagingInstruction['Pobjid4'] : null,
            ];
        }

        return $packagingInstructions;
    }

    public function itemDtos($skip, $take): array|false
    {
        $lastChangedFilter = now()->subWeek()->toDateTimeLocalString();

        $baseUrl = "sap/opu/odata/sap/API_PRODUCT_SRV/A_Product";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$format' => 'json',
            '$filter' => "LastChangeDate gt datetime'$lastChangedFilter'",
            '$expand' => "to_Description,to_Plant/to_StorageLocation,to_ProductUnitsOfMeasure",
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));
        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results'])) {
            return false;
        }

        $itemCustomIds = array_map(function ($item) {
            return $item['Product'];
        }, $res['d']['results']);

        $packagingInstructions = $this->getDefaultPackagingInstructions($itemCustomIds);

        $items = array();
        foreach ($res['d']['results'] as $product) {
            $description = $this->getDescription($product['to_Description']['results']);
            if (!$description) {
                continue;
            }

            $item = new ItemDto(
                custom_id: $product['Product'],
                name: $description['ProductDescription'],
                item_group_custom_id: $product['ProductGroup'],
                item_type_custom_id: $product['ProductType'],
                unit_of_measure_id_custom: $product['BaseUnit'],
                packaging_instruction_id_custom: $packagingInstructions[$product['Product']]['packaging_instruction_id_custom'] ?? null,
                packaging_instruction_id_1_custom: $packagingInstructions[$product['Product']]['packaging_instruction_id_1_custom'] ?? null,
                packaging_instruction_id_2_custom: $packagingInstructions[$product['Product']]['packaging_instruction_id_2_custom'] ?? null,
                packaging_instruction_id_3_custom: $packagingInstructions[$product['Product']]['packaging_instruction_id_3_custom'] ?? null,
                packaging_instruction_id_4_custom: $packagingInstructions[$product['Product']]['packaging_instruction_id_4_custom'] ?? null,
                note: $product['ZRicetta'] ?? null,
            );

            foreach ($product['to_ProductUnitsOfMeasure']['results'] as $unitOfMeasure) {
                $item->unit_of_measure_conversions[] = new UnitOfMeasureConversionDto(
                    unit_of_measure_id_custom: $unitOfMeasure['AlternativeUnit'],
                    quantity_denominator: $unitOfMeasure['QuantityDenominator'],
                    quantity_numerator: $unitOfMeasure['QuantityNumerator'],
                );
            }

            foreach ($product['to_Plant']['results'] as $plant) {
                $itemPlantDto = new ItemPlantDto(
                    plant_id_custom: $plant["Plant"],
                    is_batch_managed: $plant["IsInternalBatchManaged"],
                    storage_location_id_custom: $plant['ProductionInvtryManagedLoc'],
                    serial_number_profile_id_custom: $plant["SerialNumberProfile"],
                );

                foreach ($plant['to_StorageLocation']['results'] as $storageLocation) {
                    $itemPlantDto->storage_location_ids_custom[] = $storageLocation['StorageLocation'];
                }

                $item->plants[] = $itemPlantDto;
            }
            $items[] = $item;
        }
        return $items;
    }

    public function itemGroups(): Collection
    {
        return collect([]);
    }

    public function machineGroups(): Collection
    {
        return collect([]);
    }

    public function machineDtos(int $skip, int $take): array|false
    {

        if ($skip > 0) return false;

        $baseUrl = "sap/opu/odata/sap/API_WORK_CENTERS/A_WorkCenters";
        $queryParams = [
            '$format' => 'json',
            '$expand' => 'to_WorkCenterDescription',
            '$filter' => "WorkCenterCategoryCode eq '0001'",
            'sap-client' => env('SAP_CLIENT', 100),
        ];
        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));
        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return [];

        $machines = [];
        foreach ($res['d']['results'] as $workCenter) {
            $description = $this->getDescription($workCenter['to_WorkCenterDescription']['results']);

            if (!$description) {
                continue;
            }

            $machines[] = new MachineDto(
                custom_id: $workCenter['WorkCenter'],
                name: $description['WorkCenterDesc'],
                plant_id_custom: $workCenter['Plant'],
                production_supply_area_id_custom: $workCenter['SupplyArea'],
                standard_value_key_id_custom: $workCenter['StandardWorkFormulaParamGroup'],
            );
        }
        return $machines;
    }

    public function operations(): Collection
    {
        return collect([]);
    }

    public function prodOrders(?string $onlyCustomId): Collection
    {
        return collect([]);
    }

    private function getSerials(array $prodOrders): array
    {
        $baseUrl = "sap/opu/odata/sap/ZAPI_SERIALNUMBER_ODP_SRV/ZA_SERIALNMODP";
        $conditions = [];
        foreach ($prodOrders as $prodOrder) {
            $conditions[] = "ProductionOrder eq '" . $prodOrder . "'";
        }
        $conditionString = implode(" or ", $conditions);
        $queryParams = [
            '$format' => 'json',
            '$filter' => $conditionString,
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return [];

        $serials = [];

        foreach ($res['d']['results'] as $serial) {
            $prodOrder = $serial['ProductionOrder'];
            $serials[$prodOrder] ??= [];
            $serials[$prodOrder][] = $serial['SerialNumber'];
        }

        return $serials;
    }

    private function getBomDocuments(array $prodOrders): array
    {
        $baseUrl = "sap/opu/odata/sap/ZAPI_ODP_EWM_SRV/ZC_LETTURA_PWR";
        $conditions = [];
        foreach ($prodOrders as $prodOrder) {
            $conditions[] = "REFDOCNumOdP eq '" . str_pad($prodOrder, 12, "0", STR_PAD_LEFT) . "'";
        }
        $conditionString = "(" . implode(" or ", $conditions) . ") and DocCat eq 'PWR'";
        $queryParams = [
            '$format' => 'json',
            '$select' => 'REFDOCNumOdP,PosRifP,DocNumb,ItemTyp,UbicaPostIss,Itemnumb,NMagcompl,TypeProcess,StockType,OwnerAuth,StockOwner,stat_stage',
            '$filter' => $conditionString,
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));
        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return [];

        $prodOrderBoms = [];

        foreach ($res['d']['results'] as $prodOrderBom) {
            $prodOrder = ltrim($prodOrderBom['REFDOCNumOdP'], "0");
            $posRifP = ltrim($prodOrderBom['PosRifP'], "0"); // Trim leading zeros for PosRifP as well
            $bomPos = [
                'reference_document' => $prodOrderBom['DocNumb'] ?? null,
                'item_type' => $prodOrderBom['ItemTyp'] ?? null,
                'storage_bin_id_custom' => $prodOrderBom['UbicaPostIss'] ?? null,
                'item_number' => $prodOrderBom['Itemnumb'] ?? null,
                'warehouse_id_custom' => $prodOrderBom['NMagcompl'] ?? null,
                'warehouse_process_type' => $prodOrderBom['TypeProcess'] ?? null,
                'stock_type' => $prodOrderBom['StockType'] ?? null,
                'entitled_to_dispose_party' => $prodOrderBom['OwnerAuth'] ?? null,
                'stock_owner' => $prodOrderBom['StockOwner'] ?? null,
                'component_preparation_state' => $prodOrderBom['stat_stage'] == '9' ? ComponentPreparationState::PREPARED : ($prodOrderBom['stat_stage'] == '2' ? ComponentPreparationState::PARTIALLY_PREPARED : ($prodOrderBom['stat_stage'] == '1' ? ComponentPreparationState::NOT_PREPARED : null)),
            ];
            $prodOrderBoms[$prodOrder][$posRifP] = $bomPos;
        }

        return $prodOrderBoms;
    }

    public function prodOrderDtos(int $skip, int $take, ?string $onlyCustomId): array|false
    {
        $baseUrl = "sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder_2";
        $queryParams = [
            '$format' => 'json',
            '$filter' => ($onlyCustomId ? ("ManufacturingOrder eq '" . $onlyCustomId . "'") : ("LastChangeDateTime gt '" . now()->subWeeks(2)->format('YmdHis') . "'")),
            '$top' => $take,
            '$skip' => $skip,
            '$expand' => 'to_ProductionOrderComponent,to_ProductionOrderOperation,to_ProductionRsceTools,to_ProductionOrderItem',
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return false;

        $prodOrderCustomIds = array_map(function ($prodOrder) {
            return $prodOrder['ManufacturingOrder'];
        }, $res['d']['results']);

        $serials = $this->getSerials($prodOrderCustomIds);
        $bomDocuments = $this->getBomDocuments($prodOrderCustomIds);

        $prodOrders = [];
        foreach ($res['d']['results'] as $prodOrder) {
            $order = new ProdOrderDto(
                custom_id: $prodOrder['ManufacturingOrder'],
                document_date: $this->parseDateTimeString($prodOrder['MfgOrderCreationDate'], $prodOrder['MfgOrderCreationTime']),
                order_type: $prodOrder["ManufacturingOrderCategory"] == 10 ?
                    ProdOrderType::PRODUCTION() :
                    ProdOrderType::MAINTENANCE(),
                plant_id_production_custom: $prodOrder['ProductionPlant'],
                plant_id_custom: $prodOrder['Plant'],
                update_only: $prodOrder['OrderIsCreated'] || !$prodOrder['OrderIsReleased']
            );

            $posStatus = ProdOrderPosStatus::PLANNED();

            if ($prodOrder["OrderIsLocked"] || $prodOrder["OrderIsTechnicallyCompleted"] || $prodOrder["OrderIsClosed"]) {
                $posStatus = ProdOrderPosStatus::CLOSED();
            }
            if ($prodOrder["OrderIsMarkedForDeletion"] || $prodOrder["OrderIsDeleted"]) {
                $posStatus = ProdOrderPosStatus::DELETED();
            }
            $batch = $prodOrder['to_ProductionOrderItem']['results'][0]['Batch'] ?? null ?: null;
            if (env('EXTERNAL_DS_TARGET') == 'benacchio' && !$batch && $prodOrder["ManufacturingOrderType"] == 'ZT01') {
                $batch = "#";
            }

            $orderPosition = new ProdOrderPosDto(
                pos: "10",
                item_id_custom: strlen($prodOrder['Material']) > 0 ? $prodOrder['Material'] : null,
                start: $prodOrder["MfgOrderScheduledStartDate"] && $prodOrder["MfgOrderScheduledStartTime"] ?
                    $this->parseDateTimeString($prodOrder['MfgOrderScheduledStartDate'], $prodOrder['MfgOrderScheduledStartTime']) :
                    $this->parseDateTimeString($prodOrder['MfgOrderPlannedStartDate'], $prodOrder['MfgOrderPlannedStartTime'])
                ,
                end: $prodOrder["MfgOrderScheduledEndDate"] && $prodOrder["MfgOrderScheduledEndTime"] ?
                    $this->parseDateTimeString($prodOrder['MfgOrderScheduledEndDate'], $prodOrder['MfgOrderScheduledEndTime']) :
                    $this->parseDateTimeString($prodOrder['MfgOrderPlannedEndDate'], $prodOrder['MfgOrderPlannedEndTime'])
                ,
                status: $posStatus,
                quantity: $prodOrder['TotalQuantity'],
                serials: $serials[$prodOrder['ManufacturingOrder']] ?? [],
                storage_location_id_custom: $prodOrder['StorageLocation'],
                unit_of_measure_id_custom: $prodOrder['ProductionUnit'],
                notes: $prodOrder['OrderLongText'],
                batch: $batch,
            );

            $order->positions[] = $orderPosition;

            foreach ($prodOrder['to_ProductionOrderComponent']['results'] as $component) {
                if ($component['BOMItemCategory'] != 'L' || $component['MaterialComponentIsPhantomItem']) {
                    continue;
                }

                $orderPosition->components[] = new ProdOrderPosBomPosDto(
                    pos: $component['ReservationItem'],
                    item_id_custom: $component['Material'],
                    qty_for_one_parent: $component['RequiredQuantity'] / $orderPosition->quantity,
                    quantity_total: $component['RequiredQuantity'],
                    unit_of_measure_id_custom: $component['BaseUnit'],
                    is_active: !($component['MatlCompIsMarkedForDeletion'] ?? false),
                    is_backflush: $component['MatlCompIsMarkedForBackflush'],
                    is_quantity_fixed: $component['QuantityIsFixed'],
                    storage_location_id_custom: $component['StorageLocation'],
                    batch: $component['Batch'],
                    prod_order_pos_operation_pos: $component['ManufacturingOrderSequence'] . '-' . $component['ManufacturingOrderOperation'],
                    is_bulk: $component['IsBulkMaterialComponent'],
                    item_type: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['item_type'] ?? null,
                    reference_document: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['reference_document'] ?? null,
                    storage_bin_id_custom: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['storage_bin_id_custom'] ?? null,
                    item_number: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['item_number'] ?? null,
                    warehouse_id_custom: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['warehouse_id_custom'] ?? null,
                    warehouse_process_type: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['warehouse_process_type'] ?? null,
                    stock_type: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['stock_type'] ?? null,
                    entitled_to_dispose_party: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['entitled_to_dispose_party'] ?? null,
                    stock_owner: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['stock_owner'] ?? null,
                    component_preparation_state: $bomDocuments[$prodOrder['ManufacturingOrder']][$component['ReservationItem']]['component_preparation_state'] ?? null,
                );
            }

            $prodOrderPosOperationDto = null;
            foreach ($prodOrder['to_ProductionOrderOperation']['results'] as $operation) {
                $pos = $operation['ManufacturingOrderSequence'] . '-' . $operation['ManufacturingOrderOperation'];

                if (str_starts_with($operation['OperationControlProfile'], 'Q')) {
                    $frequency = $this->getFrequency($operation['OperationControlProfile'], $operation['qrastereh'], $operation['qrastzeht']);

                    if ($frequency !== null && $prodOrderPosOperationDto !== null) {
                        $prodOrderPosOperationDto->inspectionOperations[$pos] = new ProdInspectionOperationDto(
                            pos: $pos,
                            internal_id: $operation['OrderIntBillOfOperationsItem'] ?? null,
                            frequency: $frequency,
                            name: $operation['MfgOrderOperationText'] ?? null,
                            interval_cycles: ($operation['qrastereh'] ?? '') == 'PZ' ? intval($operation['qrastmeng']) : null,
                            interval_seconds: strlen($operation['qrastzeht'] ?? '') ? intval($operation['qrastzfak'] * $this->getMultipleOfSecondsFromUnit($operation['qrastzeht'])) : null,
                        );
                    }
                } else {
                    if ($prodOrderPosOperationDto !== null) {
                        $orderPosition->operations[$prodOrderPosOperationDto->pos] = $prodOrderPosOperationDto;
                    }

                    $operationStatus = ProdOrderPosOperationStatus::PLANNED();

                    if ($operation["OperationIsTechlyCompleted"] || $operation["OperationIsClosed"]) {
                        $operationStatus = ProdOrderPosOperationStatus::CLOSED();
                    }
                    if ($operation["OperationIsDeleted"]) {
                        $operationStatus = ProdOrderPosOperationStatus::DELETED();
                    }

                    $processingDurationSeconds =
                        $this->getMultipleOfSecondsFromUnit(
                            $operation['ProcUnit'] ?? // Custom api benacchio
                            $operation['ProcessinUM'] ?? // Custom api fna (note typo)
                            null
                        ) *
                        (
                            $operation['ProcessingTime'] ?? // Custom api benacchio
                            $operation['ProcessingDuration'] ?? // Custom api fna
                            0
                        );

                    $setupDurationSeconds =
                        $this->getMultipleOfSecondsFromUnit(
                            $operation['SetupUnit'] ?? // Custom api benacchio
                            $operation['SetupUm'] ?? // Custom api fna
                            null
                        ) *
                        (
                            $operation['SetupTime'] ?? // Custom api benacchio
                            $operation['SetupDuration'] ?? // Custom api fna
                            0
                        );

                    $prodOrderPosOperationDto = new ProdOrderPosOperationDto(
                        pos: $pos,
                        name: $operation['MfgOrderOperationText'],
                        start: $this->parseDateTimeString($operation['OpErlstSchedldExecStrtDte'], $operation['OpErlstSchedldExecStrtTme']),
                        end: $this->parseDateTimeString($operation['OpErlstSchedldExecEndDte'], $operation['OpErlstSchedldExecEndTme']),
                        te: $processingDurationSeconds / $operation['OpPlannedTotalQuantity'],
                        tr: $setupDurationSeconds,
                        cavity: strlen($prodOrder['ZZ1_COEFFICIENTESTAMPO_PLT'] ?? '') ? intval($prodOrder['ZZ1_COEFFICIENTESTAMPO_PLT']) : 1,
                        machine_id_custom: $operation['WorkCenter'],
                        status: $operationStatus,
                        registered_quantity: $operation['OpTotalConfirmedYieldQty'],
                        plant_id_production_custom: $operation['ProductionPlant'],
                        operation_control_profile_id_custom: $operation['OperationControlProfile'],
                        quantity: $operation['OpPlannedTotalQuantity'],
                        unit_of_measure_id_custom: $operation['OperationUnit'],
                        prod_lot_id_custom: $prodOrder['ZZ1_IDSTAMPAGGIO_ORD'] ?? null,
                    );
                }
            }

            if ($prodOrderPosOperationDto !== null) {
                $orderPosition->operations[$prodOrderPosOperationDto->pos] = $prodOrderPosOperationDto;
            }

            foreach ($prodOrder['to_ProductionRsceTools']['results'] as $tool) {

                $opPos = '0' . '-' . $tool['ManufacturingOrderOperation'];

                if (isset($orderPosition->operations[$opPos])) {
                    //Check if this is an equipment
                    if ($tool['ProdnRsceToolCategory'] == 'E') {
                        $orderPosition->operations[$opPos]->resources[] = new ProdOrderPosOperationResourceDto(
                            pos: $tool['MfgOrderOpProdnRsceToolIntID'],
                            equipment_id_custom: $tool['ProductionResourceTool'],
                        );
                    }
                }

                if (isset($orderPosition->operations[$prodOrderPosOperationDto->pos]->inspectionOperations[$opPos]) && $prodOrderPosOperationDto !== null) {
                    if(collect(['E', 'D'])->contains($tool['ProdnRsceToolCategory'])) {
                        $external_id = null;

                        if($tool['ProdnRsceToolCategory'] == 'D') {
                            [$docNr, $docType, $docPart, $docVersion] = explode(' ', $tool['ProductionResourceTool'], 4);

                            $external_id = json_encode([
                                'doc_type' => $docType,
                                'doc_nr' => ltrim($docNr, '0'),
                                'doc_version' => $docVersion,
                                'doc_part' => $docPart,
                            ]);
                        }

                        $orderPosition->operations[$prodOrderPosOperationDto->pos]->inspectionOperations[$opPos]->prodInspectionOperationResourceDtos[] = new ProdInspectionOperationResourceDto(
                            pos: $tool['MfgOrderOpProdnRsceToolIntID'],
                            equipment_id_custom: $tool['ProdnRsceToolCategory'] == 'E' ? $tool['ProductionResourceTool'] : null,
                            type: $tool['ProdnRsceToolCategory'] == 'E' ? ProdInspectionOperationResourceType::EQUIPMENT : ($tool['ProdnRsceToolCategory'] == 'D' ? ProdInspectionOperationResourceType::SAP_DOCUMENT : null),
                            external_id: $external_id,
                        );
                    }
                }
            }

            $prodOrders[] = $order;
        }

        return $prodOrders;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return PackagingInstructionDto[]|false
     */
    public function packagingInstructionDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata/sap/API_PACKINGINSTRUCTION/PackingInstructionHeader";
        $queryParams = [
            '$format' => 'json',
            '$top' => $take,
            '$skip' => $skip,
            '$expand' => "to_PackingInstructionComponent",
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']))
            throw new Exception("Failed to load: \n" . json_encode($res));

        if (!count($res['d']['results'])) {
            return false;
        }

        $packagingInstructions = [];

        foreach ($res['d']['results'] as $packagingInstruction) {
            $packagingDto = new PackagingInstructionDto(
                custom_id: $packagingInstruction['PackingInstructionNumber'],
                uuid: $packagingInstruction['PackingInstructionSystemUUID'],
                is_active: !$packagingInstruction['PackingInstructionIsDeleted']
            );

            foreach ($packagingInstruction['to_PackingInstructionComponent']['results'] as $packagingInstructionPos) {
                $packagingInstructionPos = new PackagingInstructionPosDto(
                    pos: $packagingInstructionPos['PackingInstructionItem'],
                    is_container: $packagingInstructionPos['PackingInstructionItem'] == 10,
                    packed_item_id_custom: $packagingInstructionPos['Material'] ?: null,
                    subordinate_packaging_instruction_uuid: $packagingInstructionPos['ItemPackingInstructionSystUUID'] ?: null,
                    target_quantity: $packagingInstructionPos['PackingInstructionItmTargetQty'],
                    unit_of_measure_id_custom: $packagingInstructionPos['UnitOfMeasure'],
                    is_active: $packagingInstructionPos['PackingInstructionItemIsDel'],
                );
                $packagingDto->positions[] = $packagingInstructionPos;
            }

            $packagingInstructions[] = $packagingDto;
        }

        return $packagingInstructions;
    }

    public function boms(): Collection
    {
        return collect([]);
    }

    public function tools(): Collection
    {
        return collect([]);
    }

    public function warehouses(): Collection
    {
        return collect([]);
    }

    public function stocks(): Collection
    {
        return collect([]);
    }

    public function callOffs(): Collection
    {
        return collect([]);
    }

    public function shiftModels(): Collection
    {
        return collect([]);
    }

    public function capacities($skip, $take): array|false
    {
        return false;
    }

    public function customers(): Collection
    {
        return collect([]);
    }

    public function suppliers(): Collection
    {
        return collect([]);
    }

    public function users(): Collection
    {
        return collect([]);
    }

    public function userGroups(): Collection
    {
        return collect([]);
    }

    public function permissionsByModuleName($moduleName): Collection
    {
        return collect([]);
    }

    public function itemStates(): Collection
    {
        return collect([]);
    }

    public function machineStates(): Collection
    {
        return collect([]);
    }

    public function machineStateGroups(): Collection
    {
        return collect([]);
    }

    public function salesOrders(): Collection
    {
        return collect([]);
    }

    public function costCenters(): Collection
    {
        return collect([]);
    }

    public function settings(): Collection
    {
        return collect([]);
    }

    public function classifications($skip, $take): array|false
    {
        return false;
    }

    public function resourceGroups($skip, $take): array|false
    {
        return false;
    }


    /**
     * @param int $skip
     * @param int $take
     * @return HallDto[]|false
     */
    public function hallDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemGroupDto[]|false
     */
    public function itemGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineGroupDto[]|false
     */
    public function machineGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return OperationPlanDto[]|false
     */
    public function operationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return BomDto[]|false
     */
    public function bomDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ToolDto[]|false
     */
    public function toolDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return WarehouseDto[]|false
     */
    public function warehouseDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata4/sap/api_warehouse_2/srvd_a2x/sap/warehouse/0001/Warehouse";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$expand' => "_WarehouseStorageType",
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['value']) || !count($res['value']))
            return false;

        $warehouses = [];

        foreach ($res['value'] as $warehouse) {
            $warehouseDto = new WarehouseDto(
                custom_id: $warehouse['EWMWarehouse'],
            );

            foreach ($warehouse['_WarehouseStorageType'] as $storageType) {
                $warehouseDto->storage_types[] = new StorageTypeDto(
                    custom_id: $storageType['EWMStorageType'],
                );
            }

            $warehouses[] = $warehouseDto;
        }

        return $warehouses;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StockDto[]|false
     */
    public function stockDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata/sap/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return false;

        $stocks = [];

        foreach ($res['d']['results'] as $stock) {
            $itemCustomId = $stock['Material'];

            $stockDto = new StockDto(
                item_id_custom: $itemCustomId,
                plant_id_custom: $stock['Plant'],
                storage_location_id_custom: $stock['StorageLocation'],
                quantity: $stock['MatlWrhsStkQtyInMatlBaseUnit'],
                batch: strlen($stock['Batch']) > 0 ? $stock['Batch'] : null,
            );
            $stocks[] = $stockDto;
        }

        return $stocks;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CallOffDto[]|false
     */
    public function callOffDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftModelDto[]|false
     */
    public function shiftModelDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CapacityDto[]|false
     */
    public function capacityDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata/sap/API_WORK_CENTERS/A_WorkCenterCapacityShift";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['d']) || !isset($res['d']['results']) || !count($res['d']['results']))
            return false;

        $capacities = [];

        foreach ($res['d']['results'] as $capacity) {
            $startDate = $this->parseDateTimeString($capacity['IntervalStartDate']);
            $endDate = $this->parseDateTimeString($capacity['IntervalEndDate']);

            // Generate capacities at most one year into the future
            $endDate = Carbon::now()->addYear()->min($endDate);

            /** @var Carbon $date */
            foreach (Carbon::parse($startDate)->daysUntil($endDate) as $date) {
                // TODO: do these definition of weekdays match?
                if ($date->weekday() == $capacity['WeekDay']) {
                    $startTime = $this->parseTime($capacity['ShiftStartTime']);
                    $endTime = $this->parseTime($capacity['ShiftEndTime']);

                    $name = $capacity['ShiftName'];

                    $capacities[] = new CapacityDto(
                        date: $date->toDateString(),
                        start_time: $startTime,
                        end_time: $endTime,
                        break_minutes: $capacity['CapacityBreakDuration'] / 60,
                        machine_id_custom: $capacity['WorkCenter'],
                        shift: $name ? new ShiftDto(
                            custom_id: $name,
                            name: $name,
                            start_time: $startTime,
                            end_time: $endTime,
                            break_minutes: $capacity['CapacityBreakDuration'] / 60,
                        ) : null,
                    );
                }
            }
        }

        return $capacities;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CustomerDto[]|false
     */
    public function customerDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return SupplierDto[]|false
     */
    public function supplierDtos(int $skip, int $take): array|false
    {
        return false;
    }

    public function userDtos(int $skip, int $take): array|false
    {
        if ($skip)
            return false;

        $baseUrl = "sap/opu/odata/SAP/ZAPI_CID_SRV/CIDSet";
        $queryParams = [
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
            }

            $dto = new UserDto(
                custom_id: $user['Cid'],
                name: $user['Name'],
                userGroupDtos: $userGroups,
            );

            $dtos[] = $dto;
        }

        return $dtos;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return UserGroupDto[]|false
     */
    public function userGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ItemStateDto[]|false
     */
    public function itemStateDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateDto[]|false
     */
    public function machineStateDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateGroupDto[]|false
     */
    public function machineStateGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return SalesOrderDto[]|false
     */
    public function salesOrderDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return DepartmentDto[]|false
     */
    public function departmentDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return TpmGroupDto[]|false
     */
    public function tpmGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return TpmSubGroupDto[]|false
     */
    public function tpmSubGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return CostCenterDto[]|false
     */
    public function costCenterDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ClassificationDto[]|false
     */
    public function classificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ResourceGroupDto[]|false
     */
    public function resourceGroupDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param string $moduleName
     * @param int $skip
     * @param int $take
     * @return PermissionDto[]|false
     */
    public function permissionsByModuleNameDtos(string $moduleName, int $skip, int $take): array|false
    {
        return false;
    }

    public function settingsDto(): SettingsDto|false
    {
        return false;
    }

    public function qualificationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ProductionSupplyAreaDto[]|false
     */
    public function productionSupplyAreaDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata/sap/API_PRODUCTIONSUPPLYAREA_SRV/A_ProductionSupplyArea";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
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

        foreach ($res['d']['results'] as $supplyArea) {
            $dtos[] = new ProductionSupplyAreaDto(
                custom_id: $supplyArea['ProductionSupplyArea'],
                plant_id_custom: $supplyArea['Plant'],
            );
        }

        return $dtos;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return StorageBinDto[]|false
     */
    public function storageBinDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata4/sap/api_whse_storage_bin_2/srvd_a2x/sap/warehousestoragebin/0001/WarehouseStorageBin";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['value']) || !count($res['value']))
            return false;

        $bins = [];

        foreach ($res['value'] as $storageBin) {
            $bins[] = new StorageBinDto(
                custom_id: $storageBin['EWMStorageBin'],
                storage_type_id_custom: $storageBin['EWMStorageType'],
            );
        }

        return $bins;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return HandlingUnitDto[]|false
     */
    public function handlingUnitDtos(int $skip, int $take): array|false
    {
        $baseUrl = "sap/opu/odata4/sap/api_handlingunit/srvd_a2x/sap/handlingunit/0001/HandlingUnit";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$expand' => '_HandlingUnitItem($expand=_HandlingUnitItemSerialNumber)',
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;
        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        if (!isset($res) || !isset($res['value']) || !count($res['value']))
            return false;

        $dtos = [];

        foreach ($res['value'] as $handlingUnit) {
            $dto = new HandlingUnitDto(
                custom_id: $handlingUnit['HandlingUnitExternalID'],
                handling_unit_item_id_custom: $handlingUnit['PackagingMaterial'],
                parent_handling_unit_id_custom: $handlingUnit['ParentHandlingUnitNumber'],
                storage_bin_id_custom: $handlingUnit['StorageBin'],
                storage_location_id_custom: $handlingUnit['StorageLocation'],
                plant_id_custom: $handlingUnit['Plant'],
            );

            foreach ($handlingUnit['_HandlingUnitItem'] as $item) {
                foreach ($item['_HandlingUnitItemSerialNumber'] as $serial) {
                    $dto->items[] = new HandlingUnitItemDto(
                        item_id_custom: $item['Material'],
                        quantity: 1,
                        serial_number: $serial['SerialNumber'],
                    );
                }
                if (!$item['_HandlingUnitItemSerialNumber']) {
                    $dto->items[] = new HandlingUnitItemDto(
                        item_id_custom: $item['Material'],
                        quantity: $item['HandlingUnitQuantity'],
                        batch: strlen($item['Batch']) > 0 ? $item['Batch'] : null,
                    );
                }
            }

            $dtos[] = $dto;
        }

        return $dtos;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ShiftDto[]|false
     */
    public function shiftDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineUserTimeDto[]|false
     */
    public function machineUserTimeDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineProdOrderPosOperationTimeDto[]|false
     */
    public function machineProdOrderPosOperationTimeDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return MachineStateTimeDto[]|false
     */
    public function machineStateTimeDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return OffDayDto[]|false
     */
    public function offDayDtos(int $skip, int $take): array|false
    {
        return false;
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
        //Just import new equipments, otherwise too many and takes forever in fna
        $maxCustomId = Equipment::query()->max('custom_id');

        $baseUrl = "sap/opu/odata/sap/API_EQUIPMENT/Equipment";
        $queryParams = [
            '$top' => $take,
            '$skip' => $skip,
            '$format' => 'json',
            '$filter' => "Equipment gt '{$maxCustomId}'",
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

    /**
     * @param $operationControlProfile
     * @return ProdInspectionOperationFrequency|null
     */
    public function getFrequency(string $operationControlProfile, ?string $cycleUnit = null, ?string $timeUnit = null): ?ProdInspectionOperationFrequency
    {
        switch ($operationControlProfile) {
            case 'QAPR':
                return ProdInspectionOperationFrequency::COMPONENT_SCANNED;
            case 'QFPR':
                return ProdInspectionOperationFrequency::OPERATION_CLOSED;
            case 'QFRQ':
                if ($cycleUnit == 'PZ') {
                    return ProdInspectionOperationFrequency::CYCLE_FREQUENCY;
                } else if (strlen($timeUnit ?? '')) {
                    return ProdInspectionOperationFrequency::TIME_FREQUENCY;
                }
                return null;
            case 'QIPR':
                return ProdInspectionOperationFrequency::OPERATION_IN_PRODUCTION;
            case 'QRST':
                return ProdInspectionOperationFrequency::MACHINE_STATE_QUALITY_RELEVANT;
            case 'QSET':
                return ProdInspectionOperationFrequency::OPERATION_IN_SETUP;
            case 'QTUR':
                return ProdInspectionOperationFrequency::MACHINE_SHIFT;
            case 'QUMV':
                return ProdInspectionOperationFrequency::HANDLING_UNIT_CREATED;
            default:
                return null;
        }
    }

    /**
     * @param int $skip
     * @param int $take
     * @return ProdInspectionOperationDto[]|false
     */
    public function prodInspectionOperationDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionLotDto[]|false
     */
    public function inspectionLotDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return AttributeSetDto[]|false
     */
    public function attributeSetDtos(int $skip, int $take): array|false
    {
        return false;
    }

    /**
     * @param int $skip
     * @param int $take
     * @return InspectionSpecificationDto[]|false
     */
    public function inspectionSpecificationDtos(int $skip, int $take): array|false
    {
        return false;
    }
}
