<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\IdGeneratorController;
use App\Enums\ProdOrderType;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosBomPos;
use App\Models\ProdOrderPosOperation;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Exception;

class MaintenanceController extends Controller
{
    protected $idGeneratorController;

    public function __construct(IdGeneratorController $idGeneratorController)
    {
        $this->idGeneratorController = $idGeneratorController;
    }
    /**
     * add data to Maintenance order
     * @param Request $request
     */
    public function createMaintenanceOrder(Request $request)
    {
        try {
            $prodOrder = ProdOrder::create([
                'custom_id' => $this->idGeneratorController->generateId('ProdOrder'),
                'order_type' => ProdOrderType::MAINTENANCE(),
            ]);

            $prodOrderPos = ProdOrderPos::create([
                'prod_order_id' => $prodOrder->id,
                'item_id' => $request->item_id,
                'pos' => $request['pos'],
                'start' => $request->start,
                'end' => $request->end,
                'quantity' => $request->quantity,
            ]);

            $operationPlanPosPayload = $this->prodOrderPosOperationPayload($request->maintenances, $prodOrderPos, $request->machine_id, $request->start, $request->end, $request->operation_plan_id_origin);
            foreach ($operationPlanPosPayload as $operationPlanPos) {
                ProdOrderPosOperation::create($operationPlanPos);
            }

            $bomPosPayload = $this->prodOrderPosBomPosPayload($request->bomPos, $prodOrderPos);
            foreach ($bomPosPayload as $bomPos) {
                ProdOrderPosBomPos::create($bomPos);
            }
            $success = true;
        } catch (Exception $e) {
            return response($e, 500);
        }
        return response($success, 200);
    }


    public function updateMaintenanceOrder(Request $request, $maintenancId)
    {
        try {
            
            if (isset($request->deletedMaintenances)) {
                foreach ($request->deletedMaintenances as $entity) {
                    ProdOrderPosOperation::where('id', $entity)->delete();
                }
            }
            if (isset($request->deletedBomPos)) {
                foreach ($request->deletedBomPos as $entity) {
                    ProdOrderPosBomPos::where('id', $entity)->delete();
                }
            }
            $prodOrderPos = ProdOrderPos::where('id', '=', $maintenancId)->with('bomPos', 'item', 'prodOrderPosOperations')->first();
        
            $prodOrderPosOperations = $request->maintenances;
            $prodOrderPosBomPos = $request->bomPos;

            $prodOrderPos->update([
                'item_id' => $request->item_id,
                'pos' => $request['pos'],
                'start' => $request->start,
                'end' => $request->end,
                'quantity' => $request->quantity,
            ]);

            foreach ($prodOrderPosOperations as $prodOrderPosOperation) {
                if (isset($prodOrderPosOperation['id'])) {
                    $entity = ProdOrderPosOperation::where('id', '=', $prodOrderPosOperation['id'])->update([
                        'name' => $prodOrderPosOperation['name'],
                        'start' => $request->start,
                        'end' => $request->end,
                        'machine_id' => $request->machine_id,
                        'quantity' => $request->quantity,
                        'pos' => $prodOrderPosOperation['pos'],
                    ]);
                }
            }
            foreach ($prodOrderPosBomPos as $bomPos) {
                if (isset($bomPos['id'])) {
                    $entity = ProdOrderPosBomPos::where('id', '=', $bomPos['id'])->update([
                        'prod_order_pos_id' => $prodOrderPos->id,
                        'item_id' => $bomPos['item_id'] ?? null,
                        'unit_of_measure_id' => $bomPos['unit_of_measure_id'] ?? null,
                        'prod_order_pos_operation_id' => $bomPos['prod_order_pos_operation_id'] ?? null,
                        'warehouse_id' => $bomPos['warehouse_id'] ?? null,
                        'storage_location_id' => $bomPos['storage_location_id'] ?? null,
                        'pos' => $bomPos['pos'],
                        'qty_for_one_parent' => $bomPos['qty_for_one_parent'] ?? 0,
                        'batch' => $bomPos['batch'] ?? null,
                        'name' => $bomPos['name'] ?? null,
                        'is_active' => $bomPos['is_active'] ?? false,
                        'is_backflush' => $bomPos['is_backflush'] ?? true,
                        'is_quantity_fixed' => $bomPos['is_quantity_fixed'] ?? false,
                        'quantity_total' => $bomPos['quantity_total'] ?? 0,
                    ]);
                }
            }
            $newBomPos = $this->prodOrderPosBomPosPayload($request->newBomPos, $prodOrderPos);
            $newMaintenances = $this->prodOrderPosOperationPayload($request->newMaintenances, $prodOrderPos, $request->machine_id, $request->start, $request->end, $request->operation_plan_id_origin);
            foreach ($newMaintenances as $entity) {
                ProdOrderPosOperation::create($entity);
            }
            foreach ($newBomPos as $bomPos) {
                ProdOrderPosBomPos::create($bomPos);
            }
            $success = true;
            return response($success, 200);
        } catch (Exception $e) {
            return response($e, 500);
        }
    }

    private function prodOrderPosOperationPayload($prodOrderPosOperations, $prodOrderPos, $machine_id, $formattedStart, $formattedEnd, $operation_plan_id_origin)
    {
        $prodOrderPosOperationArray = [];
        foreach ($prodOrderPosOperations as $operationPlanPos) {
            $data = [
                'prod_order_pos_id' => $prodOrderPos->id ?? null,
                'machine_id' => $machine_id ?? null,
                'pos' => $operationPlanPos['pos'],
                'name' => $operationPlanPos['name'] ?? null,
                'start' => $formattedStart ?? null,
                'end' => $formattedEnd ?? null,
                'te' => $operationPlanPos['te'] ?? 0.00,
                'tr' => $operationPlanPos['tr'] ?? 0.00,
                'tool_id' => $operationPlanPos['tool_id'] ?? null,
                'plan_machine_id' => $operationPlanPos['plan_machine_id'] ?? null,
                'erp_machine_id' => $operationPlanPos['erp_machine_id'] ?? null,
                'machine_group_id' => $operationPlanPos['machine_group_id'] ?? null,
                'user_group_id' => $operationPlanPos['user_group_id'] ?? null,
                'user_id' => $operationPlanPos['user_id'] ?? null,
                'prod_lot_id' => $operationPlanPos['prod_lot_id'] ?? null,
                'resource_group_id' => $operationPlanPos['resource_group_id'] ?? null,
                'resource_group_id_erp' => $operationPlanPos['resource_group_id_erp'] ?? null,
                'resource_group_id_plan' => $operationPlanPos['resource_group_id_plan'] ?? null,
                'operation_plan_id_origin' => $operation_plan_id_origin ?? null,
                'operation_plan_pos_id_origin' => $operationPlanPos['operation_plan_pos_id_origin'] ?? null,
                'plant_id_production' => $operationPlanPos['plant_id_production'] ?? null,
                'operation_control_profile_id' => $operationPlanPos['operation_control_profile_id'] ?? null,
                'unit_of_measure_id' => $operationPlanPos['unit_of_measure_id'] ?? null,
                'cavity' => $operationPlanPos['cavity'] ?? 1,
                'registered_quantity' => $operationPlanPos['registered_quantity'] ?? 0,
                'status' => $operationPlanPos['status'] ?? null,
                'comment' => $operationPlanPos['comment'] ?? null,
                'show_in_planvisu' => $operationPlanPos['show_in_planvisu'] ?? true,
                'erp_start' => $operationPlanPos['erp_start'] ?? null,
                'erp_end' => $operationPlanPos['erp_end'] ?? null,
                'plan_start' => $operationPlanPos['plan_start'] ?? null,
                'plan_end' => $operationPlanPos['plan_end'] ?? null,
                'plan_te' => $operationPlanPos['plan_te'] ?? null,
                'erp_te' => $operationPlanPos['erp_te'] ?? null,
                'is_changed' => $operationPlanPos['is_changed'] ?? false,
                'operation_code' => $operationPlanPos['operation_code'] ?? null,
                'teardown_time' => $operationPlanPos['teardown_time'] ?? null,
                'send_ahead_quantity' => $operationPlanPos['send_ahead_quantity'] ?? null,
                'transfer_time' => $operationPlanPos['transfer_time'] ?? 0,
                'operation_start_date_v10' => $operationPlanPos['operation_start_date_v10'] ?? null,
                'is_urgent_delivery' => $operationPlanPos['is_urgent_delivery'] ?? false,
                'component_availability' => $operationPlanPos['component_availability'] ?? null,
                'operator_usage_factor' => $operationPlanPos['operator_usage_factor'] ?? null,
                'has_labels_prepared' => $operationPlanPos['has_labels_prepared'] ?? false,
                'note' => $operationPlanPos['note'] ?? null,
                'is_repair_completed' => $operationPlanPos['is_repair_completed'] ?? false,
                'repair_completed_date' => $operationPlanPos['repair_completed_date'] ?? null,
                'quantity' => $operationPlanPos['quantity'] ?? 0,
                'status_erp' => $operationPlanPos['status_erp'] ?? null,
                'status_plan' => $operationPlanPos['status_plan'] ?? null,
                'operation_close_date_v10' => $operationPlanPos['operation_close_date_v10'] ?? null,
            ];
            array_push($prodOrderPosOperationArray, $data);
        }
        return $prodOrderPosOperationArray;
    }

    private function prodOrderPosBomPosPayload($bomPosData, $prodOrderPos)
    {
        $bomPosArray = [];
        foreach ($bomPosData as $bomPos) {
            $data = [
                'prod_order_pos_id' => $prodOrderPos->id,
                'item_id' => $bomPos['item_id'] ?? null,
                'unit_of_measure_id' => $bomPos['unit_of_measure_id'] ?? null,
                'prod_order_pos_operation_id' => $bomPos['prod_order_pos_operation_id'] ?? null,
                'warehouse_id' => $bomPos['warehouse_id'] ?? null,
                'storage_location_id' => $bomPos['storage_location_id'] ?? null,
                'pos' => $bomPos['pos'] ?? null,
                'qty_for_one_parent' => $bomPos['qty_for_one_parent'] ?? 0,
                'batch' => $bomPos['batch'] ?? null,
                'name' => $bomPos['name'] ?? null,
                'is_active' => $bomPos['is_active'] ?? false,
                'is_backflush' => $bomPos['is_backflush'] ?? true,
                'is_quantity_fixed' => $bomPos['is_quantity_fixed'] ?? false,
                'quantity_total' => $bomPos['quantity_total'] ?? 0,
            ];
            array_push($bomPosArray, $data);
        }
        return $bomPosArray;
    }
}
