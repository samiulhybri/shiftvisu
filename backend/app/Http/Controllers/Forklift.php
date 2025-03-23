<?php

namespace App\Http\Controllers;

use App\Enums\ProdOrderPosOperationStatus;
use App\Http\Controllers\Controller;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrderPosOperationDelivery;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class Forklift extends Controller
{
    public function acceptOrder(Request $request)
    {
        $user_id = $request->user_id;
        $prod_order_pos_operation_id = $request->prod_order_pos_operation_id;

        $isDeliveryExits = ProdOrderPosOperationDelivery::where([['prod_order_pos_operation_id', '=', $prod_order_pos_operation_id], ['is_completed', '=', false]])->first();

        if ($isDeliveryExits) {
            return response("Order already occupied", 409);
        } else {
            $delivery = [
                'prod_order_pos_operation_id' => $prod_order_pos_operation_id,
                'user_id' => $user_id
            ];

            $order = ProdOrderPosOperationDelivery::create($delivery);
            return $order;
        }
    }

    public function doneTransportation(Request $request)
    {
        $prod_order_pos_operation_id = $request->prod_order_pos_operation_id;
        $id = $request->id;
        $quantity = $request->quantity;


        $data = [
            'prod_order_pos_operation_id' => $prod_order_pos_operation_id,
            'id' => $id,
            'quantity' => $quantity,
            'is_completed' => true,
        ];
        $res = ProdOrderPosOperationDelivery::where('id', $id)->update($data);
        $deliveredQuantiy = ProdOrderPosOperationDelivery::where('prod_order_pos_operation_id', $prod_order_pos_operation_id)->sum("quantity");
        $prodOrderPosOperation = ProdOrderPosOperation::where('id', $prod_order_pos_operation_id)->with('prodOrderPos.prodOrder', 'machine', 'prodOrderPos.calculation.operationPlan.operationPlanPos', 'prodLot.machine')->first();
        $operationPos = str_pad((string) $prodOrderPosOperation->pos, 20, '0', STR_PAD_LEFT);
        $isWarmInWarm = false;
        if($prodOrderPosOperation->prodOrderPos->calculation?->operationPlan?->operationPlanPos){
            foreach ($prodOrderPosOperation->prodOrderPos->calculation?->operationPlan?->operationPlanPos as $opPlanPos) {
                $opPlanPosPos = str_pad($opPlanPos->pos, 20, '0', STR_PAD_LEFT);
                if ($opPlanPosPos == $operationPos && $opPlanPos->is_warm_in_warm) {
                    $isWarmInWarm = true;
                    break;
                }
            }
        };
        if ($isWarmInWarm) {
            $otherProdOrderPosOperations = ProdOrderPosOperation::where('machine_id', '=', $prodOrderPosOperation->machine->id)->whereRelation('prodOrderPos.prodOrder', 'id', '=', $prodOrderPosOperation->prodOrderPos->prodOrder->id)->with('prodOrderPos.prodOrder', 'machine', 'prodOrderPos.calculation.operationPlan.operationPlanPos')->get();
            foreach ($otherProdOrderPosOperations as $otherProdOrderPosOp) {
                if ($otherProdOrderPosOp->id == $prod_order_pos_operation_id) {
                    continue;
                }
                $otherOProdOrderPosOpPos = str_pad($otherProdOrderPosOp->pos, 20, '0', STR_PAD_LEFT);

                if ($otherProdOrderPosOp->prodOrderPos->calculation) {
                    foreach ($otherProdOrderPosOp->prodOrderPos->calculation?->operationPlan?->operationPlanPos as $operationPlanPosItem) {
                        $opPlanPos = str_pad($operationPlanPosItem->pos, 20, '0', STR_PAD_LEFT);
                        if ($otherOProdOrderPosOpPos == $opPlanPos && $operationPlanPosItem->is_warm_in_warm) {
                            $oterOperationData = [
                                'prod_order_pos_operation_id' => $otherProdOrderPosOp->id,
                                'id' => $id,
                                'quantity' => $quantity,
                                'is_completed' => true,
                                'user_id' => Auth::user()->id,
                            ];
                            ProdOrderPosOperationDelivery::where('id', $id)->updateOrCreate($oterOperationData);
                        }
                    }

                }
            }
        }

        if (1 <= $deliveredQuantiy) {

            // $prodOrderPosOperation->status = ProdOrderPosOperationStatus::WAITING_FOR_SETUP();
            // $prodOrderPosOperation->save();
            $v10Api = env('APP_URL');

            if ($v10Api) {

                if ($prodOrderPosOperation->prod_lot_id) { // Check if prodLot exists and has an ID
                    $prodLot = $prodOrderPosOperation->prodLot;
                    $response = Http::get($v10Api . "/mes_visu/ruesten/php/mes_visu_data_services.php?service=change_lot_status&status=2&m=". $prodLot->machine->custom_id."&lot_id=".$prodLot->custom_id."&set_to_planned=0&is_urgent=0");

                } else { // Call the original API if prodLot or its ID is missing

                    $response = Http::post($v10Api . "/mes_visu/ruesten/php/mes_visu_data_services.php?service=insert_auftrag", [
                        'typ' => 'rv',
                        'auf' => "{$prodOrderPosOperation->prodOrderPos->prodOrder->custom_id}|{$prodOrderPosOperation->pos}",
                        'machine_custom_id' => $prodOrderPosOperation->machine->custom_id,
                        'auf_teile' => [
                            [
                                'auf_nr' => "{$prodOrderPosOperation->prodOrderPos->prodOrder->custom_id}|{$prodOrderPosOperation->pos}",
                                'teile' => [
                                    [
                                        'teile_nr' => $prodOrderPosOperation->prodOrderPos->item->custom_id,
                                        'teile_bez' => $prodOrderPosOperation->prodOrderPos->item->name
                                    ]
                                ]
                            ]
                        ]
                    ]);

                }
            }
        }
        return $res;
    }
}