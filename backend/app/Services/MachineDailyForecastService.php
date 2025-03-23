<?php

namespace App\Services;

use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Models\Machine;
use App\Models\MachineDailyExpectedQuantity as ModelsMachineDailyExpectedQuantity;
use App\Models\ProdOrderPosOperation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class MachineDailyForecastService
{
    public function truncateOldData(): void
    {
        ModelsMachineDailyExpectedQuantity::truncate();
    }

    public function getActiveMachines()
    {
        return Machine::where('is_active', true)
            ->get(['id', 'name', 'custom_id']);
    }

    public function insertForecastData($predictedQuantityDetails, $order)
    {
        foreach ($predictedQuantityDetails as $key => $detail) {
            $insertableData[] = [
                'machine_id' => $order['machine_id'],
                'item_id' => $order['item_id'],
                'te' => $order['te'],
                'tr' => $detail['tr'],
                'teardown_time' => $detail['teardown_time'],
                'workloadable_id' => $order['prod_order_pos_operation_id'],
                'workloadable_type' => ProdOrderPosOperation::class,
                'quantity' => $detail['quantity'],
                'date' => $detail['actual_date'],
                'shift_id' => $detail['shift_id'],
                'cavity' => $order['cavity'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        try {
            ModelsMachineDailyExpectedQuantity::insert($insertableData);
        } catch (\Throwable $th) {
            Log::error($th);
        }
    }



    public function getMachineOrders(Machine $machine)
    {

        $startOfWeek = Carbon::now()->startOfWeek()->toDateTimeString();

        // TODO:: Need to think about the Linked Orders
        return Machine::where('id', $machine->id)
            ->whereHas('prodOrderPosOperations', function ($query) use ($startOfWeek) {
                $query->where('start', '>=', $startOfWeek)
                    ->whereNotIn('status', [ProdOrderPosStatus::CLOSED(), ProdOrderPosStatus::DELETED()])
                    ->whereHas('prodOrderPos', function ($query) {
                        $query->whereHas('prodOrder');
                    });
            })
            ->with([
                'prodOrderPosOperations' => function ($query) use ($startOfWeek) {
                    $query->where('start', '>=', $startOfWeek)
                        ->whereNotIn('status', [ProdOrderPosOperationStatus::CLOSED(), ProdOrderPosOperationStatus::DELETED()])
                        ->with([
                            'prodOrderPos' => function ($query) {
                                $query->with('prodOrder');
                            }
                        ]);
                }
            ])
            ->get()
            ->map(function ($machine) {
                return $machine->prodOrderPosOperations->map(function ($operation) use ($machine) {
                    // Helmuth wanted to calculate by ProdOrderPos->quantity rather then the send ahead quantity of the operation
                    $quantity = $operation->prodOrderPos->quantity ?? 0;
                    $item_id = $operation->prodOrderPos->item_id;
                    $registered_quantity = $operation->registered_quantity ?? 0;
                    $te = $operation->te ?? 0;
                    $tr = $operation->tr ?? 0;
                    $cavity = ($operation->cavity && $operation->cavity > 0) ? $operation->cavity : 1;
                    $teardown_time = $operation->teardown_time ?? 0;
                    $order = $operation->prodOrderPos->prodOrder->custom_id;
                    $prod_order_id = $operation->prodOrderPos->prodOrder->id;
                    $prod_order_pos_id = $operation->prodOrderPos->id;
                    $pos = $operation->pos;
                    $prod_order_pos_operation_id = $operation->id;
                    $pos_name = $operation->name;
                    $order_pos = $order . "-" . $pos . " | " . $pos_name;

                    $required_time = 0;

                    if ($machine->usage_factor > 0) {
                        $required_time =  ((($te / $cavity) * $quantity) / $machine->usage_factor)  + $tr + $teardown_time;
                    } else {
                        $required_time =  (($te / $cavity) * $quantity) + $tr + $teardown_time;
                    }

                    return [
                        'machine_id' => $machine->id,
                        'machine_custom_id' => $machine->custom_id,
                        'machine_name' => $machine->name,
                        'start' => $operation->start,
                        'end' => $operation->end,
                        'pos' => $pos,
                        'te' => $te,
                        'cavity' => $cavity,
                        'item_id' => $item_id,
                        'tr' => $tr,
                        'teardown_time' => $teardown_time,
                        'order_pos' => $order_pos,
                        'prod_order_pos_operation_id' => $prod_order_pos_operation_id,
                        'prod_order_pos_id' => $prod_order_pos_id,
                        'prod_order_id' => $prod_order_id,
                        'order' => $order,
                        'quantity' => $quantity,
                        'registered_quantity' => $registered_quantity,
                        'required_time' => $required_time,
                    ];
                });
            })
            ->flatten(1);
    }
}
