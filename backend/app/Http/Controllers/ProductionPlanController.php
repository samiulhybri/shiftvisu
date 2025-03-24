<?php

namespace App\Http\Controllers;

use App\Enums\ComponentPreparationState;
use App\Enums\OperationControlProfileConfirmationType;
use App\Enums\DataExportName;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProductionPlanType;
use App\Events\OperationClosed;
use App\Events\OperationProductionStarted;
use App\Events\OperationSetupStarted;
use App\Models\DataExport;
use App\Models\Machine;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\OperationControlProfile;
use App\Models\ProdOrderPosBomPos;
use App\Models\ProdOrderPosOperation;
use App\Services\ImportFromBTPService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductionPlanController extends Controller
{

    protected ImportFromBTPService $apiService;

    public function __construct(ImportFromBTPService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function updateOperationStatus(Request $request)
    {
        try {
            DB::transaction(function () use ($request) {
                $machine = Machine::find($request->machineId);
                if (in_array($request->status, [ProdOrderPosOperationStatus::IN_SETUP()])
                    && !$machine->supports_parallel_operations
                    && $request->state_status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                } else if ($request->state_status && $request->state_status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                    $this->updateInProductionOperations($request);
                }
                $this->updateInSetUpOperations($request);
                ProdOrderPosOperation::whereIn('id', $request->operationIds)
                    ->get()
                    ->map(function ($operation) use ($request, $machine) {
                        $this->updateOperationAndTimes($operation, $request, true, false);
                        if ($operation->prod_lot_id) {

                            $this->updateLinkedOperations($operation, $request);
                        }
                        $operation->update([
                            'status' => $request->status,
                            'status_plan' => $request->status
                        ]);

                        if ($request->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                            $this->hostIotGatewayStart($operation->machine_id, $operation);
                            event(new OperationProductionStarted($machine, $operation));
                        } else if ($request->status == ProdOrderPosOperationStatus::CLOSED()) {
                            $this->hostIotGatewayEnd($operation->machine_id, $operation);
                            $data = [
                                'prod_order_id_custom' => $operation->prodOrderPos->prodOrder->custom_id ?? '',
                                'posting_date' => now(),
                                'prod_order_pos_operation_pos' => $operation->pos ?? '',
                            ];

                            $now = now();
                            $dataExport = DataExport::query()->create([
                                'name' => DataExportName::OPERATION_CLOSED(),
                                'data' => json_encode($data),
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                            $c = new ExportController();
                            $c->singleExport($dataExport);

                            event(new OperationClosed($machine, $operation));
                        } else if($request->status == ProdOrderPosOperationStatus::IN_SETUP()) {
                            event(new OperationSetupStarted($machine, $operation));
                        }
                    });
            });
            return response()->json(['success' => true]);
        } catch (\Exception $exception) {
            return response()->json(['success' => false, 'message' => $exception->getMessage()]);
        }
    }

    private function updateOperationAndTimes(ProdOrderPosOperation $operation, $request, $isNew, $isClosed)
    {
        $oldStatus = $operation->status;
        if ($isClosed && $oldStatus) {
                $operation->prodOrderPosOperationTimes()
                ->where('machine_id', $operation->machine_id)
                ->where('end', null)
                ->where('status', $oldStatus)
                ->update(['end' => now()]);
        }
        if ($isNew) {
            $operation->prodOrderPosOperationTimes()->create([
                'machine_id' => $operation->machine_id,
                'status' => $request->status,
                'start' => now(),
            ]);
        }

    }

    private function updateLinkedOperations($operation, $request)
    {
        ProdOrderPosOperation::where('prod_lot_id', $operation->prod_lot_id)
            ->where('machine_id', $operation->machine_id)
            ->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())
            ->whereNotIn('id', $request->operationIds)
            ->get()
            ->each(function ($operation) use ($request) {
                $this->updateOperationAndTimes($operation, $request, true, false);
                $operation->update(['status' => $request->status, 'status_plan' => $request->status]);
                if ($request->status == ProdOrderPosOperationStatus::IN_PRODUCTION())
                    $this->hostIotGatewayStart($operation->machine_id, $operation);
                if ($request->state_status == ProdOrderPosOperationStatus::CLOSED())
                    $this->hostIotGatewayEnd($operation->machine_id, $operation);
            });
    }

    private function updateInProductionOperations($request)
    {
        $machineIds = $this->getMachineTimeIds(Machine::find($request->machineId));
        MachineProdOrderPosOperationTime::where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
            ->whereIn('machine_id', $machineIds)
            ->whereNull('end')
            ->with('prodOrderPosOperation')
            ->get()
            ->each(function (MachineProdOrderPosOperationTime $machineTime) use ($request) {
                $machineTime->update(['end' => now()]);
                $machineTime->prodOrderPosOperation->update(['status' => $request->state_status, 'status_plan' => $request->state_status]);
                if ($request->state_status == ProdOrderPosOperationStatus::CLOSED())
                    $this->hostIotGatewayEnd($machineTime->machine_id, $machineTime->prodOrderPosOperation);
            });
    }

    /**
     * @param $request
     * @return void
     *
     */
    private function updateInSetUpOperations($request)
    {
        $machine = Machine::find($request->machineId);
        if (
            in_array($request->status, [ProdOrderPosOperationStatus::IN_SETUP()])
            && in_array($request->state_status, [ProdOrderPosOperationStatus::SUSPENDED(), ProdOrderPosOperationStatus::CLOSED()])
            && !$machine->supports_parallel_operations
        ) {
            $machineIds = $this->getMachineTimeIds($machine);
            MachineProdOrderPosOperationTime::whereIn('status', [ProdOrderPosOperationStatus::IN_SETUP()])
                ->whereIn('machine_id', $machineIds)
                ->whereNull('end')
                ->with('prodOrderPosOperation')
                ->get()
                ->each(function (MachineProdOrderPosOperationTime $machineTime) use ($request) {
                    $machineTime->update(['end' => now()]);
                    $machineTime->prodOrderPosOperation->update(['status' => $request->state_status, 'status_plan' => $request->state_status]);
                    if ($request->state_status == ProdOrderPosOperationStatus::CLOSED())
                        $this->hostIotGatewayEnd($machineTime->machine_id, $machineTime->prodOrderPosOperation);
                });
        }
    }

    /**
     * @param Request $request
     * @return JsonResponse
     * This function provides categorized arrays:
     * - `linkOperations`: Operations linked to the same production lot and machine but not in the provided operation IDs.
     * - `inProductionOperations`: Operations currently in the production stage on the specified machines.
     * - `operationControlProfiles`: Operations with associated control profiles filtered by confirmation type and position.
     * - `inSetupOperations`: Operations currently in the setup stage on the specified machines.
     */
    public function getLinkAndProduction(Request $request): JsonResponse
    {
        $operationIds = $request->operationIds;

        $linkOperations = ProdOrderPosOperation::whereIn('id', $operationIds)
            ->get()
            ->flatMap(function ($operation) use ($operationIds) {
                return ProdOrderPosOperation::where('prod_lot_id', $operation->prod_lot_id)
                    ->whereNotNull('prod_lot_id')
                    ->where('machine_id', $operation->machine_id)
                    ->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())
                    ->whereNotIn('id', $operationIds)
                    ->with('prodOrderPos.prodOrder')
                    ->get()
                    ->map(function (ProdOrderPosOperation $pOperation) {
                        return $this->getOperationNamPos($pOperation);
                    });
            })->unique()->values()->all();
        $machineIds = $this->getMachineTimeIds(Machine::find($request->machineId));
        $inProductionOperations = MachineProdOrderPosOperationTime::whereIn('machine_id', $machineIds)
            ->where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
            ->whereNull('end')
            ->with('prodOrderPosOperation.prodOrderPos.prodOrder')
            ->get()
            ->map(function ($operation) {
                return $this->getOperationNamPos($operation->prodOrderPosOperation);
            });
        $inSetupOperations = [];
        $machine = Machine::find($request->machineId);
        if (in_array($request->status, [ProdOrderPosOperationStatus::IN_SETUP()])
            && !$machine->supports_parallel_operations) {
            $inSetupOperations = MachineProdOrderPosOperationTime::whereIn('machine_id', $machineIds)
                ->whereIn('status', [ProdOrderPosOperationStatus::IN_SETUP()])
                ->whereNull('end')
                ->with('prodOrderPosOperation.prodOrderPos.prodOrder')
                ->get()
                ->map(function ($operation) {
                    return $this->getOperationNamPos($operation->prodOrderPosOperation);
                });
        }


        $operationControlProfiles = [];

        if ($request->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
            // Fetch operations matching the criteria
            $operations = ProdOrderPosOperation::whereIn('machine_id', $machineIds)
                ->whereNotIn('status', [ProdOrderPosOperationStatus::IN_PRODUCTION(), ProdOrderPosOperationStatus::CLOSED(), ProdOrderPosOperationStatus::DELETED()])
                ->with('operationControlProfile:id,confirmation_type')
                ->whereHas('operationControlProfile', function ($query) {
                    return $query->where('confirmation_type', OperationControlProfileConfirmationType::MILESTONE)
                        ->orwHere('confirmation_type', OperationControlProfileConfirmationType::REQUIRED);
                })
                ->select('id', 'pos', 'name', 'operation_control_profile_id')
                ->get()->map(function ($item) {
                    $normalizedPos = preg_replace('/[^0-9]/', '', $item->pos);
                    $item->pos_convert = (int)ltrim($normalizedPos, '0');
                    return $item;
                })->sortByDesc('pos_convert')->values();

            // Extract positions of operations with the given IDs
            $positions = $operations->whereIn('id', $operationIds)->values(); // Reset keys for $positions
            $uniqueIds = [];
            // Process each operation
            $operations->each(function (ProdOrderPosOperation $operation) use (&$operationControlProfiles, $operationIds, $positions, &$uniqueIds) {
                // Compare operation's position against all positions in $positions
                for ($i = 0; $i < $positions->count(); $i++) {
                    if (!in_array($operation->id, $operationIds) && $operation->pos_convert < $positions->get($i)->pos_convert && !in_array($positions->get($i)->id, $uniqueIds)) {
                        // Create a new associative array for each entry
                        $operationControlProfiles[] = [...$operation->toArray(), "select_pos_id" => $positions->get($i)->id];
                        $uniqueIds[] = $positions->get($i)->id;
                        break;
                    }

                }
            });
        }

        return response()->json([
            'linkOperations' => $linkOperations,
            'inProductionOperations' => $inProductionOperations,
            'operationControlProfiles' => $operationControlProfiles,
            'inSetupOperations' => $inSetupOperations
        ]);
    }

    protected function getOperationNamPos($pOperation)
    {
        return "{$pOperation?->prodOrderPos?->prodOrder?->custom_id}-{$pOperation?->pos}";
    }

    protected function updateOperationMachineTime($request)
    {
        $machineId = $this->getMachineTimeIds(Machine::find($request->machineId));
        MachineProdOrderPosOperationTime::where('status', ProdOrderPosOperationStatus::IN_PRODUCTION())
            ->whereNull('end')
            ->whereIn('machine_id', $machineId)
            ->with('prodOrderPosOperation')
            ->get()
            ->each(function ($machineProdOrderPosOperationTime) use ($request) {
                $this->updateOperationAndTimes($machineProdOrderPosOperationTime->prodOrderPosOperation, $request, false, true);
                $machineProdOrderPosOperationTime->prodOrderPosOperation->update(['status' => $request->state_status, 'status_plan' => $request->state_status]);
                if ($request->state_status == ProdOrderPosOperationStatus::CLOSED())
                    $this->hostIotGatewayEnd($machineProdOrderPosOperationTime->machine_id, $machineProdOrderPosOperationTime->prodOrderPosOperation);
            });
    }

    protected function updateOperationTimeStatus(Request $request)
    {
        try {
            $machineIds = [];
            DB::transaction(function () use ($request, $machineIds) {
                ## if machine supports_parallel_operations off then check
                $this->updateInSetUpOperations($request);

                $machine = Machine::find($request->machineId);
                if (in_array($request->status, [ProdOrderPosOperationStatus::IN_PRODUCTION()]) && !$machine->supports_parallel_operations && $request->state_status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                    $this->updateOperationMachineTime($request);
                } else if (in_array($request->status, [ProdOrderPosOperationStatus::IN_SETUP()]) && $machine->supports_parallel_operations && $request->state_status != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                    $this->updateOperationMachineTime($request);

                }
                MachineProdOrderPosOperationTime::whereIn('id', $request->machineTimeIds)
                    ->with('prodOrderPosOperation')
                    ->get()
                    ->map(function (MachineProdOrderPosOperationTime $times) use ($request, $machineIds, $machine) {
                        $times->update([
                            'end' => now()
                        ]);

                        $times->prodOrderPosOperation->update([
                            'status' => $request->status,
                            'status_plan' => $request->status
                        ]);

                        $statusCheck = in_array($request->status, [
                            ProdOrderPosOperationStatus::CLOSED(),
                            ProdOrderPosOperationStatus::SUSPENDED(),
                            ProdOrderPosOperationStatus::PLANNED()]);

                        if (!$statusCheck) {
                            MachineProdOrderPosOperationTime::create([
                                "status" => $request->status,
                                "machine_id" => $times->machine_id,
                                "prod_order_pos_operation_id" => $times->prod_order_pos_operation_id,
                                "start" => now()
                            ]);
                        }

                        ## data preparing for other api call
                        if ($request->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                            $this->hostIotGatewayStart($times->machine_id, $times->prodOrderPosOperation);
                            event(new OperationProductionStarted($machine, $times->prodOrderPosOperation));
                        } else if ($request->status == ProdOrderPosOperationStatus::CLOSED()) {
                            $this->hostIotGatewayEnd($times->machine_id, $times->prodOrderPosOperation);

                            $data = [
                                'prod_order_id_custom' => $times->prodOrderPosOperation->prodOrderPos->prodOrder->custom_id ?? '',
                                'posting_date' => now(),
                                'prod_order_pos_operation_pos' => $times->prodOrderPosOperation->pos ?? '',
                            ];

                            $now = now();
                            $dataExport = DataExport::query()->create([
                                'name' => DataExportName::OPERATION_CLOSED(),
                                'data' => json_encode($data),
                                'created_at' => $now,
                                'updated_at' => $now,
                            ]);

                            $c = new ExportController();
                            $c->singleExport($dataExport);

                            event(new OperationClosed($machine, $times->prodOrderPosOperation));
                        } else if($request->status == ProdOrderPosOperationStatus::IN_SETUP()) {
                            event(new OperationSetupStarted($machine, $times->prodOrderPosOperation));
                        }

                        ##link operation check
                        if ($times->prodOrderPosOperation->prod_lot_id && !in_array($times->machine_id, $machineIds)) {
                            $this->updateSameOperationLot($times, $request, $statusCheck);
                        }
                    });
            });
            return response()->json(['success' => true]);
        } catch (\Exception $exception) {
            return response()->json(['success' => false, 'message' => $exception->getMessage()]);
        }
    }

    protected function updateSameOperationLot($times, $request, $statusCheck)
    {
        ProdOrderPosOperation::where('prod_lot_id', $times->prodOrderPosOperation->prod_lot_id)
            ->where('machine_id', $times->machine_id)
            ->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())
            ->whereNotIn('id', $request->operationIds)
            ->get()
            ->each(function ($operation) use ($request, $statusCheck) {
                $this->updateOperationAndTimes($operation, $request, !$statusCheck, true);
                $operation->update(['status' => $request->status, 'status_plan' => $request->status]);
            });
    }

    private function getCurlyBracketContent($string)
    {
        if (preg_match('/\{(.+?)}/', $string, $matches)) {
            return $matches[1];
        }
        return null;
    }

    protected function hostIotGatewayStart($machineId, $operation): void
    {
        $machine = Machine::findOrFail($machineId);
        if ($machine->host_iot_gateway) {
            try {
                $destination = $this->getCurlyBracketContent($machine->host_iot_gateway ?? '');
                $url = "api/machine/{$machine->id}/{$operation->id}/started";
                $body = [
                    //TODO: add remaining quantity
                ];

                if ($destination)
                    $response = $this->apiService->executeHttpRequestInBtp($url, $destination, 'POST', $body);
                else
                    $response = Http::post("{$machine->host_iot_gateway}{$url}", $body);

                Log::error(json_encode($response->body()));
            } catch (\Exception $e) {
                // Log the error or handle it as needed
                Log::error("Failed to start operation for machine ID {$machine->id}: " . $e->getMessage());
            }
        }
    }

    public function hostIotGatewayEnd($machineId, $operation): void
    {
        $machine = Machine::findOrFail($machineId);
        if ($machine->host_iot_gateway) {
            try {
                $destination = $this->getCurlyBracketContent($machine->host_iot_gateway ?? '');
                $url = "api/machine/{$machine->id}/{$operation->id}/ended";
                $body = [];

                if ($destination)
                    $response = $this->apiService->executeHttpRequestInBtp($url, $destination, 'POST', $body);
                else
                    $response = Http::post("{$machine->host_iot_gateway}{$url}", $body);

                Log::error(json_encode($response->body()));
            } catch (\Exception $e) {
                // Log the error or handle it as needed
                Log::error("Failed to end operation for machine ID {$machine->id}: " . $e->getMessage());
            }
        }
    }

    /**
     * @param Request $request
     * @param Machine $machine
     * @return JsonResponse|string
     */
    public function getProductionPlan(Request $request, Machine $machine)
    {
        try {
            $machineIds = $this->getMachineTimeIds($machine);
            $statusCondition = $this->getStatusCondition($request->input('from'));
            if (!$statusCondition) {
                // Return an empty response or handle error if no valid 'from' condition is matched
                return response()->json(['message' => 'Invalid status']);
            }
            if ($request->input('from') == ProdOrderPosOperationStatus::PLANNED()) {

                $airTankQuery = DB::table('prod_order_pos_bom_pos as pbp')
                    ->join('items as i', 'pbp.item_id', '=', 'i.id')
                    ->join('item_groups as ig', 'i.item_group_id', '=', 'ig.id')
                    ->selectRaw('pbp.prod_order_pos_operation_id, MAX(i.custom_id) as air_tank')
                    ->where('ig.custom_id', '104060')
                    ->groupBy('pbp.prod_order_pos_operation_id');

                $groupQuery = DB::table('prod_order_pos_bom_pos as pbp')
                    ->join('items as i', 'pbp.item_id', '=', 'i.id')
                    ->join('item_groups as ig', 'i.item_group_id', '=', 'ig.id')
                    ->selectRaw('pbp.prod_order_pos_operation_id, MAX(i.custom_id) as group_id')
                    ->where('ig.custom_id', '101001')
                    ->groupBy('pbp.prod_order_pos_operation_id');

                $query = DB::table('prod_order_pos_operations')
                    ->select([
                        'prod_orders.custom_id as prod_order_custom_id',
                        'prod_order_pos_operations.name as operation_name',
                        'prod_order_pos_operations.pos as operation_pos',
                        'items.custom_id as item_custom_id',
                        'prod_order_pos_operations.start as operation_start_date',
                        DB::raw('prod_order_pos_operations.quantity - COALESCE(q.good_sum, 0) as remain_quantity'),
                        DB::raw('COALESCE(q.good_sum, 0) as confirm_quantity'),
                        'prod_order_pos_operations.status',
                        'prod_order_pos_operations.id as operation_id',
                        'prod_order_pos_operations.machine_id',
                        'prod_order_pos_operations.tool_id',
                        'items.name as item_name',
                        'items.item_group_id as item_group_id',
                        'prod_order_pos.id as prod_order_pos_id',
                        'prod_lots.custom_id as prod_lot',
                        'prod_order_pos_operations.component_availability',
                        DB::raw('COALESCE(pcso.total, 0) as pcso_total'),
                        DB::raw('COALESCE(pcso.prepared, 0) as pcso_prepared'),
                        DB::raw('COALESCE(pcso.not_prepared, 0) as pcso_not_prepared'),
                        DB::raw('COALESCE(pcso.partially_prepared, 0) as pcso_partially_prepared'),
                        DB::raw('COALESCE(pcso.total_count, 0) as prodOrderPosBomPosCount'),
                        'at.air_tank',
                        'g.group_id'
                    ])
                    ->join('prod_order_pos', 'prod_order_pos_operations.prod_order_pos_id', '=', 'prod_order_pos.id')
                    ->leftJoin('items', 'prod_order_pos.item_id', '=', 'items.id')
                    ->join('prod_orders', 'prod_order_pos.prod_order_id', '=', 'prod_orders.id')
                    ->leftJoin('prod_lots', 'prod_order_pos_operations.prod_lot_id', '=', 'prod_lots.id')
                    ->leftJoinSub(
                        DB::table('prod_order_pos_operation_quantities as q')
                            ->join('item_states', function ($join) {
                                $join->on('item_states.id', '=', 'q.item_state_id')
                                    ->where('item_states.item_state_type', '=', 'GOOD');
                            })
                            ->selectRaw('prod_order_pos_operation_id, SUM(quantity) as good_sum')
                            ->groupBy('prod_order_pos_operation_id'),
                        'q',
                        'q.prod_order_pos_operation_id',
                        '=',
                        'prod_order_pos_operations.id'
                    )
                    ->leftJoinSub(
                        DB::table('prod_order_pos_bom_pos as b')
                            ->selectRaw("
                                prod_order_pos_operation_id,
                                COUNT(1) as total,
                                SUM(CASE WHEN component_preparation_state = 'PREPARED' THEN 1 ELSE 0 END) as prepared,
                                SUM(CASE WHEN component_preparation_state = 'NOT_PREPARED' THEN 1 ELSE 0 END) as not_prepared,
                                SUM(CASE WHEN component_preparation_state = 'PARTIALLY_PREPARED' THEN 1 ELSE 0 END) as partially_prepared,
                                COUNT(1) as total_count
                            ")
                            ->where('b.item_type', 'PCSO')
                            ->where('b.component_preparation_state', '!=', null)
                            ->groupBy('prod_order_pos_operation_id'),
                        'pcso',
                        'pcso.prod_order_pos_operation_id',
                        '=',
                        'prod_order_pos_operations.id'
                    )
                    ->leftJoinSub($airTankQuery, 'at', 'at.prod_order_pos_operation_id', '=', 'prod_order_pos_operations.id')
                    ->leftJoinSub($groupQuery, 'g', 'g.prod_order_pos_operation_id', '=', 'prod_order_pos_operations.id')
                    ->whereIn('prod_order_pos_operations.machine_id', $machineIds)
                    ->whereIn('prod_order_pos_operations.status', $statusCondition)->orderBy('prod_order_pos_operations.start');


                return $query->get()->map(function ($record) use ($machine) {
                    $componentPreparationState = null;

                    if($record->pcso_not_prepared) {
                        $componentPreparationState = ComponentPreparationState::NOT_PREPARED;
                    } else if ($record->pcso_partially_prepared) {
                        $componentPreparationState = ComponentPreparationState::PARTIALLY_PREPARED;
                    } else if ($record->pcso_prepared) {
                        $componentPreparationState = ComponentPreparationState::PREPARED;
                    }
                
                    return [
                        'prod_order_custom_id' => $record->prod_order_custom_id ?? null,
                        'air_tank' => $record->air_tank ?? null,
                        'group' => $record->group_id ?? null,
                        'operation_name' => $machine->production_plan_type == ProductionPlanType::SETUP_2() ? $record->operation_name : ($record->operation_pos ? "{$record->operation_pos} - {$record->operation_name}" : null),
                        'item_custom_id' => $record->item_custom_id ?? null,
                        'operation_start_date' => $record->operation_start_date ?? null,
                        'remain_quantity' => $record->remain_quantity ?? null,
                        'confirm_quantity' => $record->confirm_quantity ?? null,
                        'status' => $record->status ?? null,
                        'operation_id' => $record->operation_id ?? null,
                        'machine_id' => $record->machine_id ?? null,
                        'tool_id' => $record->tool_id ?? null,
                        'machine_time_id' => null,
                        'item' => null,
                        'item_name' => $record->item_name ?? null,
                        'prod_order_pos_id' => $record->prod_order_pos_id ?? null,
                        'prod_lot' => $record->prod_lot ?? null,
                        'component_availability' => $record->component_availability ?? null,
                        'is_prepared' => $record->pcso_total > 0 && $record->pcso_total == $record->pcso_prepared ?? null,
                        'component_preparation_state' => $componentPreparationState ?? null,
                        'prodOrderPosBomPosCount' => $record->prodOrderPosBomPosCount ?? null,
                    ];
                });
                
            } else {
                //TODO: Also this should be optimized
                $query = $this->machineTimeBuildQuery($machineIds, $statusCondition);
            
                $productionData = $query->get()->map(function ($operationTime) use ($machine) {
                    return $this->transformOperation($operationTime, false, $machine);
                });

                return collect($productionData)->sortBy('operation_start_date')->values();
            }

        } catch (\Exception $exception) {
            {
                return $exception->getMessage();
            }
        }
    }

    /**
     * @param $status
     * @return array|null
     * get array cron to status
     */
    private function getStatusCondition($status): ?array
    {
        $statusMap = [
            ProdOrderPosOperationStatus::PLANNED()->value => [ProdOrderPosOperationStatus::PLANNED()->value, ProdOrderPosOperationStatus::SUSPENDED()->value],
            ProdOrderPosOperationStatus::IN_SETUP()->value => [ProdOrderPosOperationStatus::IN_SETUP()->value, ProdOrderPosOperationStatus::WAITING_FOR_SETUP()->value, ProdOrderPosOperationStatus::IN_TEARDOWN()->value],
            ProdOrderPosOperationStatus::IN_PREPARATION()->value => [ProdOrderPosOperationStatus::IN_PREPARATION()->value],
            ProdOrderPosOperationStatus::IN_PRODUCTION()->value => [ProdOrderPosOperationStatus::IN_PRODUCTION()->value],
        ];

        return $statusMap[$status] ?? null;
    }

    /**
     * @param array $machineIds
     * @param array $statusCondition
     * @return mixed
     * get Machine  prod order pos operation time  data according to machine id
     */
    private function machineTimeBuildQuery(array $machineIds, array $statusCondition): mixed
    {
        return MachineProdOrderPosOperationTime::whereIn('machine_id', $machineIds)
            ->whereIn('status', $statusCondition)
            ->where('end', null)
            ->with([
                'prodOrderPosOperation' => function ($query) {
                    $query->orderBy('start', 'asc')
                        ->with([
                            'prodLot:id,custom_id',
                            'prodOrderPos:id,prod_order_id,quantity,item_id',
                            'prodOrderPos.prodOrder:id,custom_id',
                            'prodOrderPos.item:id,custom_id,operation_plan_id,name,bom_id,price,item_group_id',
                            'prodOrderPosOperationQuantities',
                            'prodOrderPosBomPos:id,prod_order_pos_operation_id,component_preparation_state,item_type,item_id',
                            'prodOrderPosBomPos.item.itemGroup:id,custom_id'
                        ]);
                },
            ]);
    }

    /**
     * @param array $machineIds
     * @param array $statusCondition
     * @return mixed
     */
    private function operationBuildQuery(array $machineIds, array $statusCondition): mixed
    {
        return ProdOrderPosOperation::whereIn('machine_id', $machineIds)
            ->whereIn('status', $statusCondition)
            ->orderBy('start', 'asc')
            ->with([
                'prodLot:id,custom_id',
                'prodOrderPos:id,prod_order_id,quantity,item_id',
                'prodOrderPos.prodOrder:id,custom_id',
                'prodOrderPos.item:id,custom_id,operation_plan_id,name,bom_id,price,item_group_id',
                'prodOrderPosOperationQuantities',
                'prodOrderPosOperationQuantities.itemStateGoodPart',
                'prodOrderPosBomPos:id,prod_order_pos_operation_id,component_preparation_state,item_type,item_id',
                'prodOrderPosBomPos.item.itemGroup:id,custom_id'
            ]);
    }

    private function getBomPosItemForItemGroup($operationId){
        return ProdOrderPosOperation::with([
            'prodOrderPosBomPos.item.itemGroup'
        ])
        ->where('id', $operationId)
        ->get()
        ->map(function ($operation) {
            return [
                'airTank' => $operation?->prodOrderPosBomPos
                    ?->firstWhere('item.itemGroup.custom_id', '104060') //Hardcoded group id for FNA
                    ?->item?->custom_id,
                'group' => $operation?->prodOrderPosBomPos
                    ?->firstWhere('item.itemGroup.custom_id', '101001') //Hardcoded group id for FNA
                    ?->item?->custom_id,
            ];
        })
        ->first();
    }

    /**
     * @param $operationTime
     * @param $fromProdOrderPosOperation
     * @return array
     * transform data for client side
     */
    private function transformOperation($operationTime, $fromProdOrderPosOperation, $machine): array
    {
        $operation = $fromProdOrderPosOperation ? $operationTime : $operationTime->prodOrderPosOperation;
        $prodOrderPos = $operation?->prodOrderPos;
        $prodOrder = $prodOrderPos?->prodOrder;
        $item = $prodOrderPos?->item;

        $remainingQuantity = $operation->remainingQuantity();
        $confirmQuantity = $operation->prodOrderPosOperationQuantities()
            ->whereHas('itemStateGoodPart')
            ->sum('quantity') ?? 0;

        $bomPosForItem = $this->getBomPosItemForItemGroup($operation?->id);

        return [
            'prod_order_custom_id' => $prodOrder?->custom_id ?? null,
            'air_tank' => $bomPosForItem['airTank'],
            'group' => $bomPosForItem['group'],
            'operation_name' => $machine->production_plan_type == ProductionPlanType::SETUP_2() ? $operation?->name : ($operation?->pos ? "{$operation?->pos} - {$operation?->name}" : null),
            'item_custom_id' => $item?->custom_id ?? null,
            'operation_start_date' => $operation?->start
                ? $operation?->start
                : null,
            'remain_quantity' => "{$remainingQuantity} pcs",
            'confirm_quantity' => "{$confirmQuantity} pcs",
            'status' => $operationTime->status,
            'operation_id' => $operation?->id,
            'machine_id' => $operationTime->machine_id,
            'tool_id' => $operation?->tool_id,
            'machine_time_id' => $fromProdOrderPosOperation ? null : $operationTime->id,
            'item' => $item,
            'item_name' => $item->name ?? '',
            'prod_order_pos_id' => $operation?->prod_order_pos_id,
            'prod_lot' => $operation?->prodLot?->custom_id ?? '-',
            'component_availability' => $operation?->component_availability,
            'is_prepared' => $operation->canCreateTransportOrderSingleStaging(),
            'component_preparation_state' => $operation->getComponentPreparationState(),
            'prodOrderPosBomPosCount' => $operation->prodOrderPosBomPos ? count($operation->prodOrderPosBomPos) : 0
        ];
    }

    private function getMachineTimeId($operationTime, array $statusCondition)
    {
        // Determine whether the machine time ID should be null based on the status
        if (in_array(ProdOrderPosOperationStatus::PLANNED(), $statusCondition)) {
            return null;
        }
        return $operationTime->id;
    }

    public function getStatusWiseCount(Machine $machine)
    {
        $machineIds = $this->getMachineTimeIds($machine);
        return MachineProdOrderPosOperationTime::whereIn('machine_id', $machineIds)
            ->whereNull('end')
            ->select('status')
            ->get()
            ->countBy('status');
    }

    public function getMachineTimeIds(Machine $machine)
    {
        return $machine->has_operation_pool
            ? $machine->load(['machineGroup:id', 'machineGroup.machines:machine_group_id,id'])
            ?->machineGroup
            ?->machines
            ?->pluck('id')
            ->toArray() ?? [$machine->id]
            : [$machine->id];
    }

    /**
     * @param Request $request
     * @param Machine $machine
     * @param ProdOrderPosOperation $prodOrderPosOperation
     * @return JsonResponse|string
     */
    public function printProductionPlan(Request $request, Machine $machine, ProdOrderPosOperation $prodOrderPosOperation)
    {
        try {
            $data = [
                'custom_id' => $prodOrderPosOperation->prodOrderPos->prodOrder->custom_id ?? '',
            ];

            $now = now();
            $dataExport = DataExport::create([
                'name' => DataExportName::PRINT_PRODUCTION_ORDER(),
                'data' => json_encode($data),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $c = new ExportController();
            $c->singleExport($dataExport);
            return response()->json(['success' => true]);
        } catch (\Exception $exception) {
            {
                return response()->json(['success' => false, 'message' => $exception->getMessage()], 500);
            }
        }
    }

    public function canChangeStatusOfOperation(Request $request){
        $validator = Validator::make($request->all(), [
            'operationIds' => 'required|array',
            'status' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $validatedData = $validator->validated();

        $operationIds = $validatedData['operationIds'] ?? [];
        $status = ProdOrderPosOperationStatus::from($validatedData['status']);
        $canBeChanged = true;

        if(empty($operationIds)){
            return false;
        }

        foreach ($operationIds as $operationId) {
            $isChangeable = ProdOrderPosOperation::query()->find($operationId)->canChangeOperationToStatus($status);

            if(!$isChangeable){
                $canBeChanged = false;
            }
        }

        return $canBeChanged;
    }
}
