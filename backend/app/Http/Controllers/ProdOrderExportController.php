<?php

namespace App\Http\Controllers;

use App\Enums\DataExportName;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\SectionActivatableTypes;
use App\Models\DataExport;
use App\Models\ProdOrder;
use App\Models\ProdOrderPosOperation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProdOrderExportController extends Controller
{
    public function export(): bool
    {
        try {
            $prodOrderIdChunks = DB::table('prod_orders')
                ->select('prod_orders.id')
                ->join('prod_order_pos', 'prod_order_pos.prod_order_id', 'prod_orders.id')
                ->join('prod_order_pos_operations', 'prod_order_pos_operations.prod_order_pos_id', 'prod_order_pos.id')
                ->where('prod_order_pos_operations.is_changed', true)
                ->where('prod_order_pos_operations.status_erp', '<>', ProdOrderPosOperationStatus::DELETED())
                ->where('prod_order_pos.status_erp', '<>', ProdOrderPosStatus::DELETED())
                ->groupBy('prod_orders.id')
                ->get()
                ->chunk(env('DATA_CHUNK_SIZE'));

            foreach ($prodOrderIdChunks as $prodOrderIdChunk) {
                $prodOrders = ProdOrder::with(
                    ['prodOrderPos', 'prodOrderPos.prodOrderPosOperations', 'prodOrderPos.prodOrderPosOperations.machine','prodOrderPos.prodOrderPosOperations.tool', 'prodOrderPos.prodOrderPosOperations.machine.hall'
                    ])->whereIn('id', $prodOrderIdChunk->pluck('id'))->get();

                $records = collect([]);
                $prodOrderPosOperationsIds = collect([]);
                $now = now('utc');

                foreach ($prodOrders as $prodOrder) {
                    $data = [
                        'custom_id' => $prodOrder->custom_id,
                        'order_type' => $prodOrder->order_type,
                        'pos' => collect([]),
                    ];
                    foreach ($prodOrder->prodOrderPos()
                                 ->where('prod_order_pos.status', '<>', ProdOrderPosStatus::DELETED())->get()
                             as $prodOrderPos) {
                        $pos = [
                            'pos' => $prodOrderPos->pos,
                            'quantity' => $prodOrderPos->quantity,
                            'opPlanPos' => collect([]),
                        ];
                        foreach ($prodOrderPos->prodOrderPosOperations()
                                     ->where('status', '<>', ProdOrderPosOperationStatus::DELETED())->get()
                                 as $prodOrderPosOperation) {
                            if ($prodOrderPosOperation->is_changed)
                                $prodOrderPosOperationsIds->push($prodOrderPosOperation->id);

                            $opPlanPos = [
                                'pos' => $prodOrderPosOperation->pos,
                                'name' => $prodOrderPosOperation->name,
                                'start' => $prodOrderPosOperation->start,
                                'end' => $prodOrderPosOperation->end,
                                'te' => $prodOrderPosOperation->te,
                                'cavity' => $prodOrderPosOperation->cavity,
                                'operation_code' => $prodOrderPosOperation->operation_code,
                                'operation_code_erp' => $prodOrderPosOperation->operation_code_erp,
                                'status' => $prodOrderPosOperation->status,
                                'machine_custom_id' => $prodOrderPosOperation->machine->custom_id ?? '',
                                'is_enabled_plan_visu' => (bool)$prodOrderPosOperation->machine?->sectionActivatables()->where('section', 'PLANVISU')->get()->first()?->is_active ?? false,
                                'tool_custom_id' => $prodOrderPosOperation->tool->custom_id ?? '',
                                'hall_custom_id' => $prodOrderPosOperation->machine->hall->custom_id ?? '',
                                'ict_prodid' => $prodOrderPosOperation->ict_prodid ?? '',
                            ];
                            $pos['opPlanPos']->push($opPlanPos);
                        }
                        $data['pos']->push($pos);
                    }

                    $dataExport = [
                        'name' => DataExportName::PRODUCTION_ORDER(),
                        'data' => json_encode($data),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                    $records->push($dataExport);
                }
                DataExport::insert($records->toArray());
                ProdOrderPosOperation::whereIn('id', $prodOrderPosOperationsIds)->update(['is_changed' => false]);
            }

            return true;
        } catch (\Exception $e) {
            Log::error($e);
            return false;
        }
    }
}
