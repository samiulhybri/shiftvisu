<?php

namespace App\ExportStrategies;

use App\Enums\AttributeSetOptionValuation;
use App\Enums\ItemStateType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\DataExport;
use App\Models\InspectionPoint;
use App\Models\InspectionPointCharacteristic;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Carbon;

class BenacchioExportStrategy extends SapExportStrategy
{
    public function exportOperationQuantities(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    /**
     * @throws \Exception
     */
    public function exportOperationClosed(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);
        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);

        [$sequence, $operation] = explode('-', $data->prod_order_pos_operation_pos, 2);

        $payload = [
            "ConfType" => "T",
            "ManufacturingOrder" => $data->prod_order_id_custom,
            "ManufacturingOrderOperation" => $operation,
            "PostingDate" => (new Carbon($data->posting_date ?? null))->toDateTimeLocalString(),
            "FinalConfirmationType" => "X",
            "to_Components" => [],
        ];

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
    }

    public function exportOperationMachineTimes(DataExport $dataExport): ExportResult
    {
        $data = json_decode($dataExport->data);
        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);
        $res = null;
        $method = null;
        $payload = null;

        foreach ($data->pos as $prod_order_pos) {
            foreach ($prod_order_pos->operations as $prod_order_pos_operation) {
                [$sequence, $operation] = explode('-', $prod_order_pos_operation->pos, 2);
                $setupTime = 0;
                $processingTime = 0;
                foreach ($prod_order_pos_operation->times as $time) {
                    if ($time->status == ProdOrderPosOperationStatus::IN_PRODUCTION()->value) {
                        $processingTime += $time->time;
                    } elseif ($time->status == ProdOrderPosOperationStatus::IN_SETUP()->value ||
                        $time->status == ProdOrderPosOperationStatus::IN_TEARDOWN()->value) {
                        $setupTime += $time->time;
                    }
                }

                $payload = array_filter([
                    "ConfType" => "T",
                    "ManufacturingOrder" => $data->prod_order_custom_id,
                    "ManufacturingOrderOperation" => $operation,
                    "PostingDate" => (new Carbon($data->posting_date ?? null))->toDateTimeLocalString(),
                    "SetupTime" => (string)($setupTime * 60),
                    "MachineTime" => (string)($processingTime * 60),
                    "FinalConfirmationType" => "",
                    "to_Components" => [],
                ], fn($value) => ($value !== null && $value !== "0"));

                $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

                if ($res->failed()) {
                    return new ExportResult(false, $res->body(), $method, $url, json_encode($payload));
                }
            }
        }

        if ($res)
            return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
        else
            return ExportResult::SUCCESS('Nothing to export');
    }

    public function exportOperationUserTimes(DataExport $dataExport): ExportResult
    {
        $data = json_decode($dataExport->data);
        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);
        $res = null;
        $method = null;
        $payload = null;

        foreach ($data->pos as $prod_order_pos) {
            foreach ($prod_order_pos->operations as $prod_order_pos_operation) {
                [$sequence, $operation] = explode('-', $prod_order_pos_operation->pos, 2);
                $setupTimes = collect();
                $processingTimes = collect();
                $users = collect();
                foreach ($prod_order_pos_operation->times as $time) {
                    $users->push($time->user_custom_id);
                    if ($time->status == ProdOrderPosOperationStatus::IN_PRODUCTION()->value) {
                        $processingTimes->put($time->user_custom_id, $processingTimes->get($time->user_custom_id, 0) + $time->time);
                    } elseif ($time->status == ProdOrderPosOperationStatus::IN_SETUP()->value ||
                        $time->status == ProdOrderPosOperationStatus::IN_TEARDOWN()->value) {
                        $setupTimes->put($time->user_custom_id, $setupTimes->get($time->user_custom_id, 0) + $time->time);
                    }
                }

                foreach ($users->unique() as $user) {
                    $payload = array_filter([
                        "ConfType" => "T",
                        "ManufacturingOrder" => $data->prod_order_custom_id,
                        "ManufacturingOrderOperation" => $operation,
                        "PostingDate" => (new Carbon($data->posting_date ?? null))->toDateTimeLocalString(),
                        "LaborSetupTime" => (string)($setupTimes->get($user, 0) * 60),
                        "LaborTime" => (string)($processingTimes->get($user, 0) * 60),
                        "Personnel" => $user,
                        "FinalConfirmationType" => "",
                        "to_Components" => [],
                    ], fn($value) => ($value !== null && $value !== "0"));

                    $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

                    if ($res->failed()) {
                        return new ExportResult(false, $res->body(), $method, $url, json_encode($payload));
                    }
                }
            }
        }

        if ($res)
            return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
        else
            return ExportResult::SUCCESS('Nothing to export');
    }

    public function exportMaterialDocument(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        if (count($data->handling_unit->wip ?? []) > 1)
            return ExportResult::FAIL('One handling unit can not contain more than 1 operazione');

        if (count($data->handling_unit->wip ?? []) == 1) {
            [$sequence, $operation] = explode('-', $data->handling_unit->wip[0]->prod_order_pos_operation_id_custom, 2);

            $payload = [
                "ConfType" => "Q",
                "ManufacturingOrder" => $data->handling_unit->wip[0]->prod_order_id_custom,
                "ManufacturingOrderOperation" => $operation,
                "PostingDate" => (new Carbon($data->posting_date))?->toDateTimeLocalString(),
                match (true) {
                    ($data->handling_unit->wip[0]->item_state_type == ItemStateType::GOOD()) => "ConfirmationYieldQuantity",
                    ($data->handling_unit->wip[0]->item_state_type == ItemStateType::SCRAP()) => "ConfirmationScrapQuantity",
                    ($data->handling_unit->wip[0]->item_state_type == ItemStateType::REWORK()) => "ConfirmationReworkQuantity",
                } => (string)$data->handling_unit->wip[0]->quantity ?? null,
                "Batch" => $data->handling_unit->wip[0]->batch ?? null,
                "StorageLocation" => $data->handling_unit->wip[0]->storage_location_id_custom ?? null,
                "to_Components" => collect($data->handling_unit->wip_consumptions ?? [])->map(function ($component) use ($data, $operation) {
                    return array_filter([
                        "ManufacturingOrder" => $data->handling_unit->wip[0]->prod_order_id_custom,
                        "ManufacturingOrderOperation" => $operation,
                        "Material" => $component->item_id_custom ?? null,
                        "Batch" => $component->batch ?? null,
                        "EntryQnt" => (string)$component->quantity ?? null,
                        "Hu" => $component->handling_unit_custom_id ?? null,
                    ], fn($value) => $value !== null);
                })->values()->all()
            ];

            if (($data->handling_unit->wip[0]->item_state_type == ItemStateType::GOOD() || $data->handling_unit->wip[0]->item_state_type == ItemStateType::REWORK())
                && $data->handling_unit->wip[0]->item_state_type
            ) {
                $payload['Hu'] = $data->handling_unit->handling_unit_custom_id;
            }

            if ($data->handling_unit->handling_unit_parent_custom_id) {
                $payload['HuPlus'] = $data->handling_unit->handling_unit_parent_custom_id;
            }

            if ($data->handling_unit->packaging_instruction_custom_id) {
                $payload['HuInstrNo'] = $data->handling_unit->packaging_instruction_parent_custom_id ?? $data->handling_unit->packaging_instruction_custom_id;
            }

            if ($data->handling_unit->is_parent_full) {
                $payload['CallCounter'] = 'X';
            }

            if (($data->handling_unit->wip[0]->item_state_type == ItemStateType::SCRAP() || $data->handling_unit->wip[0]->item_state_type == ItemStateType::REWORK())
                && $data->handling_unit->wip[0]->item_state_group_id_custom) {
                $payload['VarianceReasonCode'] = $data->handling_unit->wip[0]->item_state_group_id_custom;
            }
        } else {
            if (!$data->handling_unit->is_full_with_child_hu) {
                $payload = [
                    "ConfType" => "H",
                    "ManufacturingOrder" => $data->prod_order_custom_id,
                    "PostingDate" => (new Carbon($data->posting_date))?->toDateTimeLocalString(),
                    "CallCounter" => "X",
                    "HuPlus" => $data->handling_unit->handling_unit_custom_id,
                    "HuInstrNo" => $data->handling_unit->packaging_instruction_custom_id,
                    "to_Components" => [],
                ];
            } else {
                return ExportResult::SUCCESS('Nothing to be sent to monitor flussi');
            }
        }


        $res = $this->apiService->executeHttpRequestInBtp(
            $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100),
            env('BTP_DESTINATION', 'ODATA_API'),
            $method = 'POST',
            $payload,
        );

        //TODO: Retry with CSRF Problem, because Monitor flussi fails first attempt
        return $this->retryFailedCSRF($res, $method, $dataExport, $url, $payload);
    }

    public function exportEquipment(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportWarehouseTask(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportPrintHandlingUnit(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);
        $payload = [
            "ConfType" => "P",
            "Hu" => $data->handling_unit_id_custom ?? '',
            "to_Components" => []
        ];

        $payload["ManufacturingOrder"] = $data->prod_order_id_custom ?? '';

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

        //TODO: Retry with CSRF Problem, because Monitor flussi fails first attempt
        return $this->retryFailedCSRF($res, $method, $dataExport, $url, $payload);
    }

    public function exportPrintBatch(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);
        $payload = [
            "ConfType" => "P",
            "Hu" => $data->batch ?? '',
            "to_Components" => []
        ];

        $payload["ManufacturingOrder"] = $data->prod_order_id_custom ?? '';

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

        //TODO: Retry with CSRF Problem, because Monitor flussi fails first attempt
        return $this->retryFailedCSRF($res, $method, $dataExport, $url, $payload);
    }

    public function exportPrintProductionOrder(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);
        $payload = [
            "ConfType" => "S",
            "ManufacturingOrder" => $data->custom_id ?? '',
            "to_Components" => []
        ];

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

        //TODO: Retry with CSRF Problem, because Monitor flussi fails first attempt
        return $this->retryFailedCSRF($res, $method, $dataExport, $url, $payload);
    }

    public function exportPrintGoodsMovement(DataExport $dataExport): ExportResult
    {
        return ExportResult::SUCCESS();
    }

    public function exportInspectionPoint(DataExport $dataExport): ExportResult
    {
        $data = json_decode($dataExport->data);
        $res = null;
        $method = null;
        $url = null;
        $payload = null;
        $inspectionPointIdCustom = null;

        if (!$data->inspection_point_id_custom) {
            $url = "sap/opu/odata/sap/API_INSPECTIONLOT_SRV/A_InspectionSubset?sap-client=" . env('SAP_CLIENT', 100);

            $inspectionPointIdCustom = str($data->inspection_point_id % 1000000);
            $registeredDate = new Carbon($data->registered_datetime);

            $payload = [
                "InspectionLot" => $data->inspection_lot_id_custom,
                "InspPlanOperationInternalID" => $data->prod_inspection_operation_internal_id,
                "InspectionSubsetInternalID" => $inspectionPointIdCustom,
                "InspectionSubsetLongCharKey" => $inspectionPointIdCustom,
                "InspectionSubsetTime" => "PT" . $registeredDate->hour . "H" . $registeredDate->minute . "M" . $registeredDate->second . "S",
                "InspectionSubsetDate" => "/Date(" . $registeredDate->timestamp * 1000 . ")/"
            ];

            $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

            if ($res->successful()) {
                InspectionPoint::query()->updateOrCreate(
                    [
                        'id' => $data->inspection_point_id
                    ],
                    [
                        'custom_id' => $inspectionPointIdCustom,
                    ]
                );
            }
        }

        foreach ($data->characteristics as $characteristic) {
            if (!$characteristic->value && !count($characteristic->options))
                continue;

            $url = "sap/opu/odata/sap/API_INSPECTIONLOT_SRV/A_InspectionCharacteristic(InspectionLot='" . $data->inspection_lot_id_custom . "',InspPlanOperationInternalID='" . $data->prod_inspection_operation_internal_id . "',InspectionCharacteristic='" . $characteristic->inspection_operation_characteristic_pos . "')/to_InspSmplResult?sap-client=" . env('SAP_CLIENT', 100);

            $payload = array_filter([
                "InspectionLot" => $data->inspection_lot_id_custom,
                "InspectionCharacteristic" => $characteristic->inspection_operation_characteristic_pos,
                "InspPlanOperationInternalID" => $data->prod_inspection_operation_internal_id,
                "InspectionSubsetInternalID" => $inspectionPointIdCustom ?? $data->inspection_point_id_custom,
                "InspRsltFreeDefinedTestEquip" => (string)$characteristic->confirmation_number ?? null, //InspCharcConfirmationNumber is readonly in api
                "Inspector" => $characteristic->user_id_inspector_custom ?? null,
                "InspectionResultText" => $characteristic->note ?? null,
            ], fn($value) => ($value !== null) && ($value !== '')) ;

            if ($characteristic->is_quantitative) {
                $valuation = AttributeSetOptionValuation::tryFrom($characteristic->valuation_result) ?? AttributeSetOptionValuation::REJECT;

                $valStr = match ($valuation) {
                    AttributeSetOptionValuation::ACCEPT => 'A',
                    AttributeSetOptionValuation::SKIP => 'S',
                    default => 'R',
                };

                $payload["InspectionResultStatus"] = "5";
                $payload["InspResultFrmtdMeanValue"] = $characteristic->value;
                $payload["InspResultValidValuesNumber"] = 1;
                $payload["InspectionValuationResult"] = $valStr;
            } else {
                //Currently only single result supported
                $attributeCode = $characteristic->options[0]->custom_id ?? null;
                $attributeCodeGroup = $characteristic->options[0]->attribute_set_internal_id ?? null;

                if (!$attributeCode || !$attributeCodeGroup)
                    continue;

                $payload["CharacteristicAttributeCode"] = $attributeCode;
                $payload["CharacteristicAttributeCodeGrp"] = $attributeCodeGroup;
            }

            $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

            if ($res->failed()) {
                return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
            } elseif ($res->successful()) {
                InspectionPointCharacteristic::query()->updateOrCreate(
                    [
                        'id' => $characteristic->inspection_point_characteristic_id
                    ],
                    [
                        'is_exported' => true,
                    ]
                );
            }
        }

        if ($res)
            return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
        else
            return ExportResult::SUCCESS('Inspection Point already available and no characteristics set');
    }

    public
    function exportQuantityConsumption(DataExport $dataExport): ExportResult
    {
        $data = json_decode($dataExport->data);

        $url = "sap/opu/odata/SAP/ZAPI_PRODCONF_MES_DERGA_SRV/ConfirmationDataSet?sap-client=" . env('SAP_CLIENT', 100);
        $payload = [
            "ConfType" => "R",
            "ManufacturingOrder" => $data->prod_order_custom_id,
            "PostingDate" => (new Carbon($data->posting_date ?? null))->toDateTimeLocalString(),
            "to_Components" => collect($data->consumptions ?? [])->map(function ($consumption) use ($data) {
                return array_filter([
                    "ManufacturingOrder" => $data->prod_order_custom_id,
                    "Material" => $consumption->item_custom_id ?? null,
                    "Batch" => $consumption->batch ?? null,
                    "EntryQnt" => (string)$consumption->quantity ?? null,
                    "Hu" => $consumption->handling_unit_custom_id ?? null,
                ], fn($value) => $value !== null);
            })->values()->all()
        ];

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

        //TODO: Retry with CSRF Problem, because Monitor flussi fails first attempt
        return $this->retryFailedCSRF($res, $method, $dataExport, $url, $payload);
    }

    /**
     * @param Response $res
     * @param string $method
     * @param DataExport $dataExport
     * @param string $url
     * @param array $payload
     * @return ExportResult
     */
    public
    function retryFailedCSRF(Response $res, string $method, DataExport $dataExport, string $url, array $payload): ExportResult
    {
        if ($res->failed() && str_contains($res->body(), 'CSRF')) {
            $dataExport->http_method = $method;
            $dataExport->http_url = $url;
            $dataExport->http_payload = json_encode($payload);

            return $this->retry($dataExport) ?? new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
        }

        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
    }
}