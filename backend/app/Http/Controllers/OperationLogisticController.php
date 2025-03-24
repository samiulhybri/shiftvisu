<?php

namespace App\Http\Controllers;

use App\Enums\MachineConfirmationType;
use App\Models\HandlingUnit;
use App\Models\Machine;
use App\Models\ProdOrderPosOperationHandlingUnit;
use App\Models\Stock;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OperationLogisticController extends Controller
{
    public function getOperationLogisticChanges(Machine $machine, int $operation_id, int $item_id)
    {
        $response = [];

        try {
            $response['proposed_quantities'] = 0;
            // Quantity Proposed
            if ($machine->confirmation_type == MachineConfirmationType::PROPOSE_IIOT()) {
                $proposedQuantities = $this->proposeIiotQuantities($machine);
                $proposedQuantitiesForMachine = $proposedQuantities ?? [];
                $proposedQuantity = 0;

                if (!empty($proposedQuantitiesForMachine)) {
                    $operation = collect($proposedQuantitiesForMachine)
                        ->first(function ($item) use ($operation_id) {
                            return $item['prod_order_pos_operation_id'] == $operation_id;
                        });

                    if ($operation) {
                        $quantity = $operation['sum'] ?? 0;
                        $proposedQuantity = (int) $quantity;
                    }
                }
                $response['proposed_quantities'] = $proposedQuantity;
            }
            $quantityInHandlingUnit = $this->quantityInHandlingUnit($machine);
            $response['quantity_in_handling_unit'] = $quantityInHandlingUnit;
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
        return response()->json($response, 200);
    }

    private function quantityInHandlingUnit(Machine $machine)
    {
        $type = 'PROD_GOOD';

        $result = ProdOrderPosOperationHandlingUnit::where('machine_id', $machine->id)
            ->where('type', $type)
            ->get();

        if (!empty($result) && count($result) > 0) {
            $selectedHandlingUnit = $result[0];
            $stockPosData = $this->getStockPosData($selectedHandlingUnit);
            $quantityInHandlingUnit = 0;

            foreach ($stockPosData as $stock) {
                if (!empty($stock['quantity'])) {
                    $quantityInHandlingUnit += (int) ($stock['quantity'] ?? 0);
                }
            }
            return $quantityInHandlingUnit;
        } else {
            return 0;
        }
    }

    private function proposeIiotQuantities(Machine $machine): array
    {
        $dbResults = DB::select(
            "
            SELECT
                c.type,
                SUM(c.quantity * t.cavity) as sum,
                MAX(c.id) as last_id,
                t.prod_order_pos_operation_id,
                c.serial
            FROM machine_cycles c
            JOIN machine_prod_order_pos_operation_times t ON
                c.machine_id = t.machine_id AND
                (
                c.registered_datetime >= t.start AND (c.registered_datetime <= t.end OR t.end IS NULL) AND
                (c.prod_order_pos_operation_id = t.prod_order_pos_operation_id OR c.prod_order_pos_operation_id IS NULL)
                )
            WHERE c.machine_id = ?
                AND c.confirmed_datetime IS NULL
            GROUP BY c.type, t.prod_order_pos_operation_id, c.serial",
            [
                $machine->id
            ]
        );

        $res = [];

        foreach ($dbResults as $dbResult) {
            $res[] = [
                "type" => $dbResult->type,
                "sum" => floatval($dbResult->sum),
                "last_id" => $dbResult->last_id,
                "prod_order_pos_operation_id" => $dbResult->prod_order_pos_operation_id,
                "serial" => $dbResult->serial,
            ];
        }

        return $res;
    }

    public function getStockPosData(HandlingUnit $selectedHandlingUnit)
    {
        $handlingUnitId = $selectedHandlingUnit->id;
        $positionableType = 'App\\Models\\HandlingUnit';

        $query = Stock::query();
        if ($handlingUnitId) {
            if ($handlingUnitId === 'null') {
                $query->whereNull('positionable_id');
            } else if ($handlingUnitId === 'ne null') {
                $query->whereNotNull('positionable_id');
            } else {
                $positionableIdsArray = explode(',', $handlingUnitId);
                $query->whereIn('positionable_id', $positionableIdsArray);
            }
        }

        if ($positionableType) {
            if ($positionableType === 'null') {
                $query->whereNull('positionable_type');
            } else if ($positionableType === 'ne null') {
                $query->whereNotNull('positionable_type');
            } else {
                $positionableTypesArray = explode(',', $positionableType);
                $query->whereIn('positionable_type', $positionableTypesArray);
            }
        }

        $stocks = $query->get();
        return $this->processStocks($stocks);
    }

    private function processStocks(Collection $stocks)
    {
        $processedStocks = [];
        foreach ($stocks as $stock) {
            $stockData = $stock->toArray();

            $stockData['handlingUnit'] = null;
            $stockData['item'] = null;

            $stockData['itemState'] = $stock->itemState ? $stock->itemState->toArray() : null;
            $processedStocks[] = $stockData;
        }
        return $processedStocks;
    }
}
