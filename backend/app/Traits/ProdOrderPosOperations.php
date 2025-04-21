<?php

namespace App\Traits;

use App\Enums\ProdOrderPosOperationStatus;
use App\Models\ProdOrderPosOperation;
use Illuminate\Http\Request;

trait ProdOrderPosOperations
{
    /**
     * Get All ProdOrderPosOperations based on Ids (array)
     */
    private function getProdOrderPosOperations(Request $request)
    {
        $status = [ProdOrderPosOperationStatus::IN_PRODUCTION(), ProdOrderPosOperationStatus::IN_SETUP(), ProdOrderPosOperationStatus::IN_TEARDOWN()];

        return ProdOrderPosOperation::with([
            'prodOrderPosOperationTimes' => function ($query) use ($status) {
                $query->with([
                    'itemPackaging' => function ($query) {
                        $query->select('id', 'custom_id', 'name');
                    },
                ])->select('id', 'start', 'prod_order_pos_operation_id', 'item_id_packaging', 'status', 'start', 'end')
                    ->whereIn('status', $status)->orderBy('start', 'asc');
            },
            'prodOrderPos' => function ($query) {
                $query->select('id', 'item_id', "prod_order_id", "quantity")->with([
                    'item' => function ($query) {
                        $query->select('id', 'custom_id', 'name', 'packaging_instruction_id','packaging_instruction_id_1','packaging_instruction_id_2', 'packaging_instruction_id_3', 'packaging_instruction_id_4');
                        $query->with(['itemPlants']);
                    },
                    'prodOrder' => function ($query) {
                        $query->select('id', 'custom_id', 'plant_id_production');
                    }
                ]);
            },
            'prodOrderPosOperationQuantities' => function ($query) {
                $query->with(['itemState'])->select('id', 'item_state_id', 'quantity', 'confirmed_datetime', 'prod_order_pos_operation_id')->orderBy('quantity', 'desc');
            },
            'unitOfMeasure',
            'prodOrderPosOperationLoadedQuantities'
        ])
            ->select('id', 'te', 'prod_order_pos_id', 'machine_id', 'pos', 'name', 'start', 'end', 'unit_of_measure_id', 'prod_lot_id', 'tr', 'cavity')
            ->whereIn('id', $request->prodOrderPosOperationIds)
            ->orderBy('id', 'asc')
            ->get();
    }
}
