<?php

namespace App\ExportStrategies;

use App\Contracts\ExportStrategy;
use App\Enums\DataExportName;
use App\Enums\ItemStateType;
use App\Http\Controllers\ExportController;
use App\Models\DataExport;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrderPosOperationConfirmation;
use App\Services\ImportFromBTPService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class SapExportStrategy extends ExportStrategy
{

    protected ImportFromBTPService $apiService;

    public function __construct(ImportFromBTPService $apiService)
    {
        $this->apiService = $apiService;
    }

    protected function retry(DataExport $dataExport): ?ExportResult
    {
        if ($dataExport->http_method && $dataExport->http_url) {
            $res = $this->apiService->executeHttpRequestInBtp(
                $dataExport->http_url,
                env('BTP_DESTINATION', 'ODATA_API'),
                $dataExport->http_method,
                $dataExport->http_payload ? json_decode($dataExport->http_payload) : null,
            );
            return new ExportResult(
                $res->successful(),
                $res->body(),
                $dataExport->http_method,
                $dataExport->http_url,
                $dataExport->http_payload
            );
        } else {
            return null;
        }
    }

    public function exportOperationQuantities(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);
        [$sequence, $operation] = explode('-', $data->prod_order_pos_operation_pos, 2);

        $goodQty = $data->item_state_type == ItemStateType::GOOD() ? $data->quantity : 0;
        $reworkQty = $data->item_state_type == ItemStateType::REWORK() ? $data->quantity : 0;
        $scrapQty = $data->item_state_type == ItemStateType::SCRAP() ? $data->quantity : 0;

        $proposedConf = $this->apiService->executeHttpRequestInBtp(
            "sap/opu/odata/sap/API_PROD_ORDER_CONFIRMATION_2_SRV/GetConfProposal?OrderID='" . $data->prod_order_id_custom . "'&Sequence='" . $sequence . "'&OrderOperation='" . $operation . "'&ConfirmationYieldQuantity=" . $goodQty . "M&ConfirmationScrapQuantity=" . $scrapQty . "M&ConfirmationReworkQuantity=" . $reworkQty . "M&sap-client=" . env('SAP_CLIENT', 100),
            env('BTP_DESTINATION', 'ODATA_API'),
            'POST',
        );

        if($proposedConf->failed())
            return ExportResult::FAIL('Failed to retrieve conf proposal');

        $confBody = json_decode($proposedConf->body())->d->GetConfProposal;
        unset($confBody->__metadata);

        for ($i = 1; $i <= 6; $i++) {
            $unitField = "OpWorkQuantityUnit{$i}";
            if (strlen($confBody->$unitField ?? '') < 1) {
                unset($confBody->$unitField);
                unset($confBody->{"NoFurtherOpWorkQuantity{$i}IsExpd"});
                unset($confBody->{"OpConfirmedWorkQuantity{$i}"});
                unset($confBody->{"WorkQuantityUnit{$i}ISOCode"});
                unset($confBody->{"WorkQuantityUnit{$i}SAPCode"});
            }
        }


//            TODO: Temporarily dropped support for cancellation
//        if (!isset($data->cancellation_for_id)) {
        $confBody->OrderID = $data->prod_order_id_custom;
        $confBody->Sequence = $sequence;
        $confBody->OrderOperation = $operation;

        if ($data->item_state_type == ItemStateType::GOOD())
            $confBody->ConfirmationYieldQuantity = (string)$data->quantity;
        if ($data->item_state_type == ItemStateType::SCRAP())
            $confBody->ConfirmationScrapQuantity = (string)$data->quantity;
        if ($data->item_state_type == ItemStateType::REWORK())
            $confBody->ConfirmationReworkQuantity = (string)$data->quantity;

        $confBody->ConfirmationUnit = $data->unit_of_measure_id_custom;

//            $confBody->Personnel = $data->user_id_custom;
        $confBody->WorkCenter = $data->machine_id_custom;
        $confBody->IsFinalConfirmation = $data->is_final_confirmation;
        if ($data->is_final_confirmation) {
            $confBody->FinalConfirmationType = 'X';
        }

        if (
            $data->item_state_group_id_custom &&
            ($data->item_state_type == ItemStateType::SCRAP() ||
                $data->item_state_type == ItemStateType::REWORK())
        ) {
            $confBody->VarianceReasonCode = $data->item_state_group_id_custom;
        }

        $proposedResponse = $this->apiService->executeHttpRequestInBtp(
            "sap/opu/odata/sap/API_PROD_ORDER_CONFIRMATION_2_SRV/GetGdsMvtProposal?OrderID='" . $data->prod_order_id_custom . "'&Sequence='" . $sequence . "'&OrderOperation='" . $operation . "'&ConfirmationYieldQuantity=" . $data->quantity . "M&ConfirmationScrapQuantity=0M&ConfirmationReworkQuantity=0M&sap-client=" . env('SAP_CLIENT', 100),
            env('BTP_DESTINATION', 'ODATA_API'),
            'POST',
        );

        $proposed = collect(json_decode($proposedResponse->body())->d->results);

        $proposedMaterialIds = $proposed->map(fn($prop) => $prop->Material);

        $manuallyChangedMaterials = collect($data->consumptions)
            ->map(function ($consumption) use ($data) {
                return [
                    "OrderID" => $data->prod_order_id_custom,
                    "Material" => $consumption->item_id_custom,
                    "Batch" => $consumption->batch ?? null,
                    "EntryUnit" => $consumption->unit_of_measure_id_custom,
                    "QuantityInEntryUnit" => $consumption->quantity,
                    "StorageLocation" => $consumption->storage_location_id_custom ?? null,
                    "EWMWarehouse" => $consumption->warehouse_id_custom ?? null,
                    "ProductionSupplyArea" => $consumption->production_supply_area_id_custom ?? null,
                    "EWMStorageBin" => $consumption->storage_bin_id_custom ?? null,
                    "Plant" => $data->plant_id_custom,
                    "ManuallyChanged" => $consumption->manually_changed,
                    "GoodsMovementType" => "261",
                ];
            });

        $results = $proposed->map(function ($proposed) use ($manuallyChangedMaterials, $data) {
            unset($proposed->__metadata);

            //If one of the proposed items has been changed, override with manual value
            if ($mat = $manuallyChangedMaterials->where('Material', $proposed->Material)->first()) {
                $proposed->QuantityInEntryUnit = str($mat['QuantityInEntryUnit']);
                $proposed->EntryUnit = $mat['EntryUnit'];
            }

            //Add batch to positions with 101
            if ($proposed->GoodsMovementType == '101' && $proposed->Material == $data->item_id_custom) {
                $proposed->Batch = $data->batch ?? null;
            }

            return $proposed;
        })->merge($manuallyChangedMaterials
            //Merge all rows that have been manually added (not only changed)
            ->filter(function ($consumption) use ($proposedMaterialIds) {
                return $consumption['ManuallyChanged'] && !$proposedMaterialIds->contains($consumption['Material']);
            })
        )->filter(function ($consumption) {
            //Filter out rows with QTY 0
            return (floatval((string)$consumption->QuantityInEntryUnit) ?? 0) > 0;
        });

        if ($results->isNotEmpty()) {
            $confBody->to_ProdnOrdConfMatlDocItm = [
                "results" => $results->values()->all()
            ];
        }


        $res = $this->apiService->executeHttpRequestInBtp(
            $url = "sap/opu/odata/sap/API_PROD_ORDER_CONFIRMATION_2_SRV/ProdnOrdConf2?sap-client=" . env('SAP_CLIENT', 100),
            env('BTP_DESTINATION', 'ODATA_API'),
            $method = 'POST',
            $confBody,
        );
        if ($res->successful()) {
            $responseData = $res->json()['d'];
            $custom_id = json_encode([
                'ConfirmationGroup' => $responseData['ConfirmationGroup'],
                'ConfirmationCount' => $responseData['ConfirmationCount'],
            ]);
            $confirmation = ProdOrderPosOperationConfirmation::find($data->id);
            $confirmation->custom_id = $custom_id;
            $confirmation->save();
        }
        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($confBody));
//        }
//        else {
//            $customIdToCancel = ProdOrderPosOperationQuantity::find($data->cancellation_for_id)->custom_id;
//
//            $decoded = json_decode($customIdToCancel, true);
//            // For some reason we need to send these as "strings", therefore we need to add quotes.
//            $idPayload = [
//                'ConfirmationGroup' => "'" . $decoded['ConfirmationGroup'] . "'",
//                'ConfirmationCount' => "'" . $decoded['ConfirmationCount'] . "'",
//                'sap-client' => env('SAP_CLIENT', 100),
//            ];
//
//            $query = http_build_query($idPayload);
//
//            $res = $this->apiService->executeHttpRequestInBtp(
//                $url = "sap/opu/odata/sap/API_PROD_ORDER_CONFIRMATION_2_SRV/CancelProdnOrdConf?" . $query,
//                env('BTP_DESTINATION', 'ODATA_API'),
//                $method = 'POST'
//            );
//
//            return new ExportResult($res->successful(), $res->body(), $method, $url,);
//        }
    }

    public function exportMaterialDocument(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        $items = collect($data->handling_unit->wip)->filter(function ($item) {
            return $item->item_state_type != ItemStateType::SCRAP();
        });

        if($items->isEmpty())
            return ExportResult::SUCCESS('No Good or Rework in this material document');


        if($items->first()->serial)
            $items = $this->groupSerials($items);

        $payload = [
            "GoodsMovementCode" => "02",
            "to_MaterialDocumentItem" => [
                "results" => $items->map(function ($item) {
                    $p = [
                        "ManufacturingOrder" => $item->prod_order_id_custom,
                        "GoodsMovementType" => "101",
                        "Material" => $item->item_id_custom,
                        "Plant" => $item->plant_id_custom,
                        "StorageLocation" => $item->storage_location_id_custom,
                        "EntryUnit" => $item->unit_of_measure_id_custom,
                        "QuantityInEntryUnit" => (string)$item->quantity,
                        "Batch" => $item->batch,
                        "GoodsMovementRefDocType" => "F",
                    ];

                    if (count($item->serials ?? [])) {
                        $p["to_SerialNumbers"] = [
                            "results" => collect($item->serials)->map(fn($serialNumber) => [
                                "SerialNumber" => $serialNumber
                            ])->values()->all()
                        ];
                    }

                    return $p;
                })->values()->all()
            ]
        ];

        $res = $this->apiService->executeHttpRequestInBtp(
            $url = "sap/opu/odata/sap/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader?sap-client=" . env('SAP_CLIENT', 100),
            env('BTP_DESTINATION', 'ODATA_API'),
            $method = 'POST',
            $payload,
        );

        //Create Export for Print Goods movement
        if ($res->successful() && ($res->json()['d']['MaterialDocument'] ?? null) && ($res->json()['d']['MaterialDocumentYear'] ?? null)) {
            foreach ($items as $item) {
                $materialDocument = $res->json()['d']['MaterialDocument'];
                $materialDocumentYear = $res->json()['d']['MaterialDocumentYear'];
                $operation = ProdOrderPosOperation::find($item->prod_order_pos_operation_id);

                $data = [
                    "material_document" => $materialDocument,
                    "material_document_year" => $materialDocumentYear,
                    "prod_order_id_custom" => $item->prod_order_id_custom,
                    "prod_order_pos_operation_id_custom" => $item->prod_order_pos_operation_id_custom,
                    "item_id_custom" => $item->item_id_custom,
                    "printer_name" => $operation->machine?->printer_name ?? '',
                    "quantity" => $item->quantity,
                ];

                $now = now();
                $dataExport = DataExport::create([
                    'name' => DataExportName::PRINT_GOODS_MOVEMENT(),
                    'data' => json_encode($data),
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $c = new ExportController();

                $c->singleExport($dataExport);
            }
        }

        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
    }

    public function groupSerials(Collection $items): Collection
    {
        return $items->groupBy(function ($item) {
            // Convert stdClass to array before processing
            return json_encode(collect((array) $item)->except('serial')->toArray());
        })->map(function ($group) {
            // Convert stdClass to array for manipulation
            $base = (array) $group->first();

            // Collect serials and remove the single "serial" field
            $base['serials'] = $group->pluck('serial')->toArray();
            $base['quantity'] = $group->count();
            unset($base['serial']);

            return (object) $base; // Convert back to object if needed
        })->values(); // Reset numeric keys
    }

    public function exportEquipment(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        if(!strlen($data->custom_id ?? ''))
            return ExportResult::SUCCESS('Component equipment id not found');

        $validity = new Carbon($data->validity_end);
        $validity = $validity->toDateTimeLocalString();

        $url = "sap/opu/odata/sap/API_EQUIPMENT/InstallEquipment?Equipment='" . $data->custom_id . "'&ValidityEndDate=datetime'" . $validity . "'&SuperordinateEquipment='" . $data->parent_id_custom . "'&sap-client=" . env('SAP_CLIENT', 100);
        $urlIfMatch = "sap/opu/odata/sap/API_EQUIPMENT/Equipment(Equipment='" . $data->custom_id . "',ValidityEndDate=datetime'" . $validity . "')";

        $res = $this->apiService->executeHttpRequestInBtp(
            $url,
            env('BTP_DESTINATION', 'ODATA_API'),
            $method = 'POST',
            [],
            $urlIfMatch
        );

        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode([]));
    }

    public function exportWarehouseTask(DataExport $dataExport): ExportResult
    {
        $data = json_decode($dataExport->data);

        //Check for Single Order Staging if already open task
        if ($data->handling_unit_id_custom ?? null) {
            $openTasks = false;

            $url = "sap/opu/odata4/sap/api_warehouse_order_task_2/srvd_a2x/sap/warehouseorder/0001/WarehouseTask?\$filter=SourceHandlingUnit eq '{$data->handling_unit_id_custom}' and WarehouseTaskStatus eq ''&sap-client=" . env('SAP_CLIENT', 100);
            $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

            if ($res->successful()) {
                $tasks = $res->json()['value'];
                $openTasks = is_array($tasks) && count($tasks) > 0;
            }

            if ($openTasks)
                return new ExportResult(true, "There is already an open Warehouse Task for HU {$data->handling_unit_id_custom}. No new task created");
        }

        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        if ($data->handling_unit_id_custom ?? null) {
            $body = [
                "EWMWarehouse" => $data->warehouse_id_custom,
                "SourceHandlingUnit" => $data->handling_unit_id_custom,
                "WarehouseProcessType" => $data->warehouse_process_type ?? ' ',
                "DestinationStorageType" => $data->destination_storage_type ?? ' ',
                "DestinationStorageBin" => $data->storage_bin_id_custom ?? ' ',
            ];
        } else {
            $body = [
                "EWMWarehouse" => $data->warehouse_id_custom,
                "WarehouseProcessType" => $data->warehouse_process_type ?? ' ',
                "Product" => $data->item_id_custom ?? null,
                "Batch" => $data->batch ?? null,
                "TargetQuantityInAltvUnit" => $data->target_quantity ?? null,
                "AlternativeUnit" => $data->unit_of_measure_id_custom ?? null,
                "EWMStockType" => $data->stock_type ?? null,
                "EntitledToDisposeParty" => $data->entitled_to_dispose_party ?? null,
                "EWMStockOwner" => $data->stock_owner ?? null,
                "SourceStorageType" => '',
                "SourceStorageBin" => '',
                "SourceHandlingUnit" => $data->handling_unit_id_custom ?? ' ',
                "DestinationStorageType" => $data->destination_storage_type ?? ' ',
                "DestinationStorageBin" => $data->storage_bin_id_custom ?? ' ',
                "DestinationHandlingUnit" => ' ',
            ];
        }


        $url = "sap/opu/odata4/sap/api_warehouse_order_task_2/srvd_a2x/sap/warehouseorder/0001/WarehouseTask?sap-client=" . env('SAP_CLIENT', 100);
        $res = $this->apiService->executeHttpRequestInBtp(
            $url,
            env('BTP_DESTINATION', 'ODATA_API'),
            $method = 'POST',
            $body
        );

        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($body));
    }

    public function exportPrintHandlingUnit(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);
        [, $operation] = explode('-', $data->prod_order_pos_operation_pos, 2);

        $baseUrl = "sap/opu/odata/SAP/ZMES_PRINT_LABEL_SRV/ImportLabel";
        $queryParams = [
            'AUFNR' => "'{$data->prod_order_id_custom}'" ?? '',
            'VORNR' => "'{$operation}'" ?? '',
            'PRINTER' => "'{$data->printer_name}'" ?? '',
            'MATNR' => "'{$data->item_id_custom}'" ?? '',
            'HU' => "'{$data->handling_unit_id_custom}'" ?? '',
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;

        $payload = [];

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

        return new ExportResult($res->successful(), $res->body(), $method, $url, json_encode($payload));
    }

    public function exportPrintGoodsMovement(DataExport $dataExport): ExportResult
    {
        $retryResult = $this->retry($dataExport);
        if ($retryResult) {
            return $retryResult;
        }

        $data = json_decode($dataExport->data);

        if($data->printer_name) {

            $baseUrl = "sap/opu/odata/SAP/Z_PRINT_LABEL_VERSAMENTO_SRV/ImportDocVers";
            $queryParams = [
                'MBLNR' => "'{$data->material_document}'" ?? '',
                'MJAHR' => "'{$data->material_document_year}'" ?? '',
                'PRINTER' => "'{$data->printer_name}'" ?? '',
                'sap-client' => env('SAP_CLIENT', 100),
            ];

            $queryString = http_build_query($queryParams);
            $url = $baseUrl . '?' . $queryString;
            $payload = [];
            $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'), $method = 'POST', $payload);

            $result = false;
            if($res->successful() && strlen(json_decode($res->body())->d->ImportDocVers->MESSAGE ?? '')) {
                $result = true;
            }

            return new ExportResult($result, $res->body(), $method, $url, json_encode($payload));
        } else {
            return ExportResult::SUCCESS();
        }
    }
}
