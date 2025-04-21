<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Enums\OperationControlProfileConfirmationType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\PlanVisuImport;
use App\Models\Item;
use App\Models\Machine;
use App\Models\MachineGroup;
use App\Models\OperationControlProfile;
use App\Models\ProdOrderPosOperationAltMachine;
use App\Models\UserGroup;
use App\Models\ResourceGroup;
use App\Models\ProdOrderPosOperation;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosBomPos;
use App\Models\SalesOrder;
use App\Models\Tool;
use App\Models\DataImport;
use App\Models\ProdOrderPosSerial;
use App\Services\CapacityPlanService;
use App\Services\ItemService;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProdOrderImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:prodorder {custom_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    protected CapacityPlanService $capacityPlanService;
    protected ItemService $itemService;

    public function __construct(CapacityPlanService $capacityPlanService, ItemService $itemService)
    {
        parent::__construct();

        $this->capacityPlanService = $capacityPlanService;
        $this->itemService = $itemService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $onlyCustomId = $this->argument('custom_id');
        $ds = new ExternalDataSourceController();
        $prod_orders = $ds->prodOrders($onlyCustomId);

        $items = collect();
        foreach (Item::all() as $item) {
            $items[$item->custom_id] = $item->id;
        }

        $machines = collect();
        foreach (Machine::all() as $machine) {
            $machines[$machine->custom_id] = $machine->id;
        }

        $userGroups = collect();
        foreach (UserGroup::all() as $userGroup) {
            $userGroups[$userGroup->custom_id] = $userGroup->id;
        }

        $resourceGroups = collect();
        foreach (ResourceGroup::all() as $resourceGroup) {
            $resourceGroups[$resourceGroup->custom_id] = $resourceGroup->id;
        }

        $machine_groups = collect();
        foreach (MachineGroup::all() as $machineGroup) {
            $machine_groups[$machineGroup->custom_id] = [
                'id' => $machineGroup->id,
                'auto_assign_machine' => $machineGroup->auto_assign_machine,
                'default_te' => $machineGroup->default_te,
                'machine_id' => $machineGroup->machines->first()->id ?? null,
            ];
        }

        $tools = collect();
        foreach (Tool::all() as $tool) {
            $tools[$tool->custom_id] = $tool->id;
        }

        $sop = [];
        foreach (SalesOrder::with('salesOrderPos')->get() as $salesOrder) {
            foreach ($salesOrder->salesOrderPos as $salesOrderPos) {
                $sop[$salesOrder->custom_id][$salesOrderPos->pos] = $salesOrderPos->id;
            }
        }

        $xmlIds = [];
        $importedOrderIds = [];
        $importedOperations = [];
        $controlProfileId = OperationControlProfile::where('confirmation_type',OperationControlProfileConfirmationType::MILESTONE->value)->first()?->id ?? null;
        foreach ($prod_orders as $prod_order_chunk) {
            foreach ($prod_order_chunk as $prod_order) {
                // If the external data source didn't apply the right filter do it here.
                if ($onlyCustomId && !str_contains($prod_order['custom_id'], $onlyCustomId)) {
                    continue;
                }

                if (isset($prod_order['xml_id']) && !in_array($prod_order['xml_id'], $xmlIds)) {
                    $xmlIds[] = $prod_order['xml_id'];
                }

                $record = ProdOrder::where(
                    'custom_id',
                    $prod_order['custom_id']
                )->first();

                if (!$record) {
                    $record = new ProdOrder();
                    $record->custom_id = $prod_order['custom_id'];
                }

                FieldChecker::setField('assembly', $record, $prod_order, $record->assembly);
                FieldChecker::setField('document_date', $record, $prod_order, $record->document_date);
                FieldChecker::setField('production_register', $record, $prod_order, $record->production_register);
                $record->save();
                $importedOrderIds[] = $record->id;
                if ($items->has($prod_order['custom_item_id'])) {

                    if (isset($prod_order['pos'])) {
                        $pos = ProdOrderPos::where('prod_order_id', $record->id)->where('pos', $prod_order['pos'])->first();
                    } else {
                        $pos = ProdOrderPos::where('prod_order_id', $record->id)->where('pos', $prod_order['custom_pos'])->first();
                    }

                    if (!$pos) {
                        $pos = new ProdOrderPos();
                        $pos->prod_order_id = $record->id;

                        if (isset($prod_order['pos'])) {
                            $pos->pos = $prod_order['pos'];
                        } else {
                            $pos->pos = $prod_order['custom_pos'];
                        }
                    }
                    $releaseDate = $pos->release_date;
                    $pos->item_id = $items[$prod_order['custom_item_id']];
                    $pos->batch = $prod_order['batch'] ?? null;
                    FieldChecker::setField('raw_material', $pos, $prod_order, $pos->raw_material);
                    FieldChecker::setField('release_date', $pos, $prod_order, $pos->release_date);
                    FieldChecker::setField('due_date', $pos, $prod_order, $pos->due_date);

                    $pos->status_erp = $prod_order['status'] ?? ProdOrderPosStatus::PLANNED();

                    $hasOperationInProduction = $pos->prodOrderPosOperations()
                        ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
                        ->exists();

                    if (($pos->status_erp == ProdOrderPosStatus::DELETED()
                            || $pos->status_erp == ProdOrderPosStatus::CLOSED())
                        && !$hasOperationInProduction
                    ) {
                        $pos->status = $pos->status_erp;
                    } else if ($pos->status != ProdOrderPosStatus::IN_PRODUCTION()) {
                        $pos->status = $pos->status_plan ?? $pos->status_erp;
                    }

                    if (isset($prod_order['custom_sales_order_id']) && isset($prod_order['custom_sales_order_pos']) && isset($sop[$prod_order['custom_sales_order_id']][$prod_order['custom_sales_order_pos']])) {
                        $pos->sales_order_pos_id = $sop[$prod_order['custom_sales_order_id']][$prod_order['custom_sales_order_pos']];
                    } else {
                        $pos->sales_order_pos_id = null;
                    }

                    if(isset($prod_order['is_production_possible'])) {
                        $pos->is_production_possible = $prod_order['is_production_possible'];
                    }

                    $pos->start = $prod_order['start'];
                    $pos->end = $prod_order['end'];
                    $pos->quantity = $prod_order['quantity'];
                    //TODO: Values hardcoded for now
                    // $pos->cavity = 1;
                    $pos->save();

                    // handle serial number of this order
                    if (isset($prod_order['prod_order_pos_serials'])) {
                        for ($i = 0; $i < count($prod_order['prod_order_pos_serials']); $i++) {
                            $serial = ProdOrderPosSerial::where('serial', $prod_order['prod_order_pos_serials'][$i])->first();
                            if ($serial) {
                                $serial->prod_order_pos_id = $pos->id;
                            } else {
                                $serial = new ProdOrderPosSerial();
                                $serial->prod_order_pos_id = $pos->id;
                                $serial->serial = $prod_order['prod_order_pos_serials'][$i];
                            }
                            $serial->save();
                        }
                    }

                    /**
                     * we have same number of pos, name, tr and te
                     * that's why I loop through any one of this
                     */
                    $end_date = null;
                    for ($i = 0; $i < count($prod_order['custom_op_plan_pos']); $i++) {
                        $op_pos = ProdOrderPosOperation::where('prod_order_pos_id', $pos->id)->where('pos', $prod_order['custom_op_plan_pos'][$i])->first();
                        if (!$op_pos) {
                            $op_pos = new ProdOrderPosOperation();
                            $op_pos->prod_order_pos_id = $pos->id;
                            $op_pos->pos = $prod_order['custom_op_plan_pos'][$i];
                        }

                        if (isset($prod_order['op_plan_pos_custom_machine_id'][$i])) {
                            if ($machines->has($prod_order['op_plan_pos_custom_machine_id'][$i])) {
                                $op_pos->erp_machine_id = $machines[$prod_order['op_plan_pos_custom_machine_id'][$i]];
                            } else {
                                $op_pos->erp_machine_id = null;
                            }
                        }else {
                            $op_pos->erp_machine_id = null;
                        }
                        
                        $op_pos->machine_id = $op_pos->plan_machine_id ?? $op_pos->erp_machine_id;

                        $op_pos->ict_babtec = $prod_order['op_plan_pos_ict_babtec'][$i] ?? '';
                        $op_pos->ict_prodid = $prod_order['op_plan_pos_ict_prodid'][$i] ?? '';
                        $op_pos->note = $prod_order['op_plan_pos_note'][$i] ?? '';
                        $op_pos->comment = $prod_order['op_plan_pos_comment'][$i] ?? '';
                        $op_pos->has_labels_prepared = $prod_order['op_plan_pos_has_labels_prepared'][$i] ?? false;
                        $op_pos->has_components_prepared = $prod_order['is_production_possible'] ?? false;
                        $op_pos->name = $prod_order['op_plan_pos_name'][$i] ?? '';

                        $op_pos->status_erp = $prod_order['op_plan_pos_status'][$i] ?? ProdOrderPosOperationStatus::PLANNED();

                        // for client ADK only
                        if(env('EXTERNAL_DS_TARGET') == 'adk_v2') {
                            $op_pos->status_plan = $prod_order['op_plan_pos_status'][$i] ?? ProdOrderPosOperationStatus::PLANNED();     
                        }
                        if ($op_pos->status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                            if (($op_pos->status_erp == ProdOrderPosOperationStatus::DELETED()
                                    || $op_pos->status_erp == ProdOrderPosOperationStatus::CLOSED()) &&
                                $op_pos->status != ProdOrderPosOperationStatus::IN_PRODUCTION()
                            ) {
                                $op_pos->status = $op_pos->status_erp;
                            } else {
                                $op_pos->status = $op_pos->status_plan ?? $op_pos->status_erp;
                            }
                        }

                        $cavityFound = $prod_order['op_plan_pos_cavity'][$i] ?? 1;

                        $op_pos->erp_te = $prod_order['op_plan_pos_te'][$i] ?? 0;
                        $op_pos->registered_quantity = $prod_order['op_plan_pos_registered_quantity'][$i] ?? 0;
                        $op_pos->cavity = $cavityFound ? $cavityFound : 1;
                        $op_pos->operator_usage_factor = isset($prod_order['operator_usage_factor']) ? ($prod_order['operator_usage_factor'][$i] ?? 1) : 1;
                        $op_pos->user_group_id = isset($prod_order['op_user_group_custom_id']) ? ($userGroups[$prod_order['op_user_group_custom_id'][$i]] ?? null) : null;
                        $op_pos->operation_code = isset($prod_order['op_operation_code']) ? ($prod_order['op_operation_code'][$i] ?? '') : '';
                        $op_pos->send_ahead_quantity = isset($prod_order['op_plan_send_ahead_quantity']) ? ($prod_order['op_plan_send_ahead_quantity'][$i] ?? ($prod_order['quantity'] ?? 0)) : 0;
                        $op_pos->transfer_time = isset($prod_order['transfer_time']) ? ($prod_order['transfer_time'][$i] ?? 0) : 0;

                        $op_pos->erp_component_availability = isset($prod_order['op_plan_pos_component_availability']) ? ($prod_order['op_plan_pos_component_availability'][$i] ?? null) : null;
                        $op_pos->component_availability = $op_pos->plan_component_availability ?? $op_pos->erp_component_availability;

                        // we will store row id in op plan pos
                        // data source is giving us the custom id.

                        if (isset($prod_order['op_operation_code'][$i])) {
                            if ($resourceGroups->has($prod_order['op_operation_code'][$i])) {
                                $op_pos->resource_group_id_erp = $resourceGroups[$prod_order['op_operation_code'][$i]];
                            } else {
                                $op_pos->resource_group_id_erp = null;
                            }
                        }

                        if (isset($prod_order['op_plan_pos_custom_machine_group_id']) && count($prod_order['op_plan_pos_custom_machine_group_id']) > 0) {
                            if ($machine_groups->has($prod_order['op_plan_pos_custom_machine_group_id'][$i])) {
                                $machGroup = $machine_groups[$prod_order['op_plan_pos_custom_machine_group_id'][$i]];
                                $op_pos->machine_group_id = $machGroup['id'];
                                if (isset($machGroup['default_te'])) {
                                    $op_pos->erp_te = $machGroup['default_te'];
                                }
                            } else {
                                $op_pos->machine_group_id = null;
                            }
                        }

                        if (isset($prod_order['op_plan_pos_custom_tool_id'])) {
                            if ($tools->has($prod_order['op_plan_pos_custom_tool_id'][$i])) {
                                $op_pos->tool_id = $tools[$prod_order['op_plan_pos_custom_tool_id'][$i]];
                            } else {
                                $op_pos->tool_id = null;
                            }
                        }

                        if (isset($prod_order['op_plan_pos_custom_tool_insert_id'])) {
                            if ($tools->has($prod_order['op_plan_pos_custom_tool_insert_id'][$i])) {
                                $op_pos->tool_insert_id = $tools[$prod_order['op_plan_pos_custom_tool_insert_id'][$i]];
                            } else {
                                $op_pos->tool_insert_id = null;
                            }
                        }

                        $op_pos->erp_tr = $prod_order['op_plan_pos_tr'][$i] ?? 0;
                        $op_pos->tr = $op_pos->plan_tr ?? $op_pos->erp_tr ?? 0;

                        $op_pos->erp_teardown_time = isset($prod_order['teardown_time']) ? ($prod_order['teardown_time'][$i] ?? 0) : 0;
                        $op_pos->teardown_time = $op_pos->plan_teardown_time ?? $op_pos->erp_teardown_time;

                        $op_pos->erp_cavity = $op_pos->cavity;
                        $op_pos->cavity = $op_pos->plan_cavity ?? $op_pos->erp_cavity;

                        $op_pos->resource_group_id = $op_pos->resource_group_id_plan ?? $op_pos->resource_group_id_erp;
                        $op_pos->te = ($op_pos->plan_te ?? $op_pos->erp_te) ?? 0;
                        $cavity         = $op_pos->cavity ? $op_pos->cavity : 1;
                        $duration       = (($op_pos->te / $cavity) * $pos->quantity) + ($op_pos->tr ?? 0) + ($op_pos->teardown_time ?? 0);
                        $usage_factor = $op_pos->machine?->usage_factor ?? null;
                        if($usage_factor > 0)  $duration = $duration / $usage_factor ;
                        if (env(key: 'EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            $op_pos->erp_start = $end_date ??  $this->capacityPlanService->calculateEndTime($pos->release_date, $duration, $op_pos->machine_id)['start'];
                        } else {
                            $op_pos->erp_start = $prod_order['op_plan_pos_start'][$i];
                        }

                        if(env('EXTERNAL_DS_TARGET') == 'vop' || env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            if(isset($op_pos->erp_start) && isset($op_pos->machine_id)) {
                                $op_pos->erp_end = $end_date = $this->capacityPlanService->calculateEndTime($op_pos->erp_start, $duration, $op_pos->machine_id)['end'];
                            }

                            if(isset($op_pos->plan_start) && isset($op_pos->machine_id)) {
                                $op_pos->plan_end  = $this->capacityPlanService->calculateEndTime($op_pos->plan_start, $duration, $op_pos->machine_id)['end'];
                            }
                        }else {
                            $op_pos->erp_end = $prod_order['op_plan_pos_end'][$i];
                        }
                        if( env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            if($releaseDate == $pos->release_date){
                                $op_pos->start = $op_pos->plan_start ?? $op_pos->erp_start;
                                $op_pos->end = $op_pos->plan_end ?? $op_pos->erp_end;
                            }else{
                                $op_pos->start =  $op_pos->erp_start;
                                $op_pos->end = $op_pos->erp_end;
                            }
                            
                        }else {
                            $op_pos->start = $op_pos->plan_start ?? $op_pos->erp_start;
                            $op_pos->end = $op_pos->plan_end ?? $op_pos->erp_end;
                        }
                        
                        $op_pos->operation_control_profile_id = $controlProfileId;

                        if($op_pos->status == ProdOrderPosOperationStatus::CLOSED() || $op_pos->status == ProdOrderPosOperationStatus::DELETED())
                            $op_pos->operation_close_date_v10 = $op_pos->operation_close_date_v10 ?? now();

                        $op_pos->save();

                        $importedOperations[] = $op_pos;

                        if (env('EXTERNAL_DS_TARGET') == 'ict' || env('EXTERNAL_DS_TARGET') == 'ict_test') {
                            if($op_pos->resource_group_id) {
                                $this->operationAltMachines($op_pos, true);
                            }
                            if($op_pos->machine?->machine_group_id) {
                                $this->operationAltMachines($op_pos);
                            }
                        }
                    }

                    if (isset($prod_order['custom_bom_pos'])) {
                        $bom_pos = ProdOrderPosBomPos::where('prod_order_pos_id', $pos->id)->where('pos', $prod_order['custom_bom_pos'])->first();
                        if (!$bom_pos) {
                            $bom_pos = new ProdOrderPosBomPos();
                            $bom_pos->prod_order_pos_id = $pos->id;
                            $bom_pos->pos = $prod_order['custom_bom_pos'];
                        }

                        $bom_pos->qty_for_one_parent = $prod_order['qty_for_one_parent'];
                        if (isset($prod_order['op_bom_pos_custom_item_id']) && $items->has($prod_order['op_bom_pos_custom_item_id'])) {
                            $bom_pos->item_id = $items[$prod_order['op_bom_pos_custom_item_id']];
                        } else {
                            $bom_pos->item_id = null;
                        }
                        $bom_pos->save();
                    }
                } else {
                    Log::error("Pord order import: item: {$prod_order['custom_item_id']} not found");
                }
            }
        }

        # START:: this section needed for All client that have plan visu
        if(count($importedOrderIds) && env('EXTERNAL_DS_TARGET') != 'sap' && $onlyCustomId == null) {

            // excluding the maintenance orders
            $posIdsToDelete = ProdOrderPos::whereNotIn('prod_order_id', $importedOrderIds)
                    ->whereHas('prodOrder', function ($query) {
                        $query->where('order_type', '!=', ProdOrderType::MAINTENANCE());
                    })
                    ->select('id')
                    ->pluck('id')
                    ->toArray();

            // Update prod_orders table and exclude the maintenance orders
            ProdOrder::whereNotIn('id', $importedOrderIds)
                ->where('order_type', '!=', ProdOrderType::MAINTENANCE())
                ->update([
                    'is_closed' => true
                ]);

            // Update prod_order_pos table
            ProdOrderPos::whereIn('id', $posIdsToDelete)
                ->update([
                    'status' => ProdOrderPosStatus::DELETED(),
                    'status_plan' => ProdOrderPosStatus::DELETED()
                ]);

            // Make sure all operations of a deleted pos are also deleted except the production one.
            ProdOrderPosOperation::whereIn('prod_order_pos_id', $posIdsToDelete)
                ->whereDoesntHave('prodOrderPosOperationTimes', function ($query) {
                    $query->whereNull('end');
                })
                ->update([
                    'status' => ProdOrderPosOperationStatus::DELETED(),
                    'status_plan' => ProdOrderPosOperationStatus::DELETED()
                ]);
        }
        # END::end update the status of the prodOrderPos & prodOrderPosOperation of the order that are not in the ERP list

        # START::Tool ID wise start datetime
        if (count($importedOperations)) {
            $importedOperations = collect($importedOperations)
                            ->whereNotIn('status', [ProdOrderPosOperationStatus::DELETED(), ProdOrderPosOperationStatus::CLOSED()])
                            ->whereNotNull('item_id_tool')
                            ->sortBy('start')
                            ->select('id', 'item_id_tool', 'start', 'status')
                            ->values();

            $itemToolWiseStartDateTime = [];
            $toolIds = [];
            foreach ($importedOperations as $operation) {
                if(!isset($operation['item_id_tool']) || !isset($operation['start'])) {
                    continue;
                }
                if(!in_array($operation['item_id_tool'], $toolIds)) {
                    $itemToolWiseStartDateTime[] = [
                        'tool_id'   => $operation['item_id_tool'],
                        'start_date'=> $operation['start']
                    ];

                    $toolIds[] = $operation['item_id_tool'];
                }
            }

            $this->itemService->updateToolsRepairsProdDate($itemToolWiseStartDateTime);
        }
        # END::Tool ID wise start datetime

        // $xmlIds is valid then we will update the xmls table.
        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new PlanVisuImport(['t_auftrag', 't_auftrag_teile']));
        }
        return 0;
    }

    protected function operationAltMachines($operation, $fromMachineResourceGroup = false)
    {

        if ($fromMachineResourceGroup) {
            DB::table('machine_resource_groups')->where('resource_group_id', $operation->resource_group_id)
                ->get()
                ->map(function ($group, $index) use ($operation) {
                    $this->insAltMachine($operation, $group->machine_id, $index);
                });
        } else {

            Machine::where('machine_group_id', $operation->machine?->machine_group_id)
                ->get()
                ->map(function ($machine, $index) use ($operation) {
                    $this->insAltMachine($operation, $machine->id, $index);
                });
        }

    }

    protected function insAltMachine($operation, $machineId, $index)
    {
        try {
            ProdOrderPosOperationAltMachine::updateOrCreate(
                [
                    'pos' => $operation->pos . $index,
                    'prod_order_pos_operation_id' => $operation->id,
                ],
                [
                    'te' => $operation->te,
                    'machine_id' => $machineId,
                ]
            );
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }
}
