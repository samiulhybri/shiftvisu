<?php

namespace App\Http\Controllers;

use App\Enums\ComponentAvailability;
use App\Enums\DataExportName;
use App\Models\DataExport;
use App\Models\ProdOrderPosOperation;
use App\Services\ImportFromBTPService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseOrderController extends Controller
{
    protected ImportFromBTPService $apiService;
    protected ExportController $exportController;

    public function __construct(ExportController $exportController, ImportFromBTPService $apiService)
    {
        $this->apiService = $apiService;
        $this->exportController = $exportController;
    }

    /**
     * @param ProdOrderPosOperation $operation
     * @param Request $request
     * @return JsonResponse
     */
    function createCrossOrderTasks(ProdOrderPosOperation $operation, Request $request): JsonResponse
    {
        $request->validate([
            'warehouse_tasks' => 'required|array',
            'warehouse_tasks.*.prod_order_pos_bom_pos_id' => 'required|integer|exists:prod_order_pos_bom_pos,id',
            'warehouse_tasks.*.quantity' => 'required|numeric|gt:0',
        ]);

        $warehouseTasks = collect($request->get('warehouse_tasks', []));

        $crossOrderComponents = $operation->prodOrderPosBomPos()
            ->whereIn('id', $warehouseTasks->pluck('prod_order_pos_bom_pos_id')->toArray())
            ->whereIn('item_type', ['PCCO', 'PCNS', 'PCSO'])
            ->get();


        $counter = 0;
        foreach ($crossOrderComponents as $crossOrderComponent) {
            $counter++;
            $task = $warehouseTasks->firstWhere('prod_order_pos_bom_pos_id', $crossOrderComponent->id);

            if(($task['quantity'] ?? 0) <= 0)
                continue;

            $docToExport = DataExport::create([
                "name" => DataExportName::WAREHOUSE_TASK(),
                "data" => json_encode([
                    "warehouse_id_custom" => $crossOrderComponent->warehouse->custom_id ?? null,
                    "warehouse_process_type" => 'Y320',
                    "item_id_custom" => $crossOrderComponent->item->custom_id ?? null,
                    "batch" => $crossOrderComponent->batch ?? null,
                    "target_quantity" => $task['quantity'],
                    "unit_of_measure_id_custom" => $crossOrderComponent->unitOfMeasure->custom_id ?? null,
                    "stock_type" => $crossOrderComponent->stock_type ?? null,
                    "entitled_to_dispose_party" => $crossOrderComponent->entitled_to_dispose_party ?? null,
                    "stock_owner" => $crossOrderComponent->stock_owner ?? null,
                    "destination_storage_type" => $crossOrderComponent->storageBin->storageType->custom_id ?? null,
                    "storage_bin_id_custom" => $crossOrderComponent->storageBin->custom_id ?? null,
                ])
            ]);

            $this->exportController->singleExport($docToExport);
        }
        return response()->json($counter);
    }

    /**
     * @param ProdOrderPosOperation $operation
     * @return JsonResponse
     * @throws Exception
     */
    function createTasks(ProdOrderPosOperation $operation): JsonResponse
    {
        $baseUrl = "sap/opu/odata4/sap/api_whse_physstockprod/srvd_a2x/sap/whsephysicalstockproducts/0001/WarehousePhysicalStockProducts";
        $conditions = [];

        $singleOrderComponents = $operation->prodOrderPosBomPos()
            ->where('item_type', 'PCSO')
            ->whereNotNull('reference_document')
            ->whereNotNull('storage_bin_id')
            ->whereNotNull('item_number')
            ->get();

        foreach ($singleOrderComponents as $singleOrderComponent) {
            $conditions[] = "(EWMStockReferenceDocument eq '{$singleOrderComponent->reference_document}' and EWMStorageBin ne '{$singleOrderComponent->storageBin->custom_id}' and EWMStockReferenceDocumentItem eq '{$singleOrderComponent->item_number}')";
        }

        $conditionString = "(".implode(" or ", $conditions).")";
        $queryParams = [
            '$format' => 'json',
            '$select' => 'EWMWarehouse,HandlingUnitNumber',
            '$filter' => "EWMStockReferenceDocCategory eq 'PWR' and EWMStorageType eq 'PREP' and {$conditionString}",
            'sap-client' => env('SAP_CLIENT', 100),
        ];

        $queryString = http_build_query($queryParams);
        $url = $baseUrl . '?' . $queryString;

        $res = $this->apiService->executeHttpRequestInBtp($url, env('BTP_DESTINATION', 'ODATA_API'));

        $tuples = [];

        foreach ($res['value'] ?? [] as $handlingUnit) {
            $warehouse = $handlingUnit['EWMWarehouse'] ?? null; // VALUE 1
            $handlingUnitNumber = $handlingUnit['HandlingUnitNumber'] ?? null; // VALUE 2

            if(!$warehouse || !$handlingUnitNumber) {
                continue;
            }

            // Create a tuple as an array
            $tuple = [$warehouse, $handlingUnitNumber];

            // Serialize the tuple and use it as a key to check for uniqueness
            $tupleKey = serialize($tuple);

            // Add the tuple only if it's not already in the array
            if (!isset($tuples[$tupleKey])) {
                $tuples[$tupleKey] = $tuple;

                $docToExport = DataExport::create([
                    "name" => DataExportName::WAREHOUSE_TASK(),
                    "data" => json_encode([
                        "warehouse_id_custom" => $warehouse,
                        "handling_unit_id_custom" => $handlingUnitNumber,
                    ])
                ]);

                $this->exportController->singleExport($docToExport);
            }

        }

        if(count($tuples)) {
            $operation->component_availability = ComponentAvailability::PLANNED();
            $operation->save();
        }
        else {
            $operation->component_availability = ComponentAvailability::FULL();
            $operation->save();
        }

        return response()->json(count($tuples));
    }
}
