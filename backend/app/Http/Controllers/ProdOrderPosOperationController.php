<?php

namespace App\Http\Controllers;

use App\Enums\ItemStateType;
use App\Enums\MachineConstraintType;
use App\Enums\OperationControlProfileConfirmationType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderType;
use App\Events\OperationClosed;
use App\Models\Hall;
use App\Models\Machine;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\ProdOrderPosOperation;
use App\Enums\SectionActivatableTypes;
use App\Enums\ToolRepairStatus;
use App\Models\Item;
use App\Models\ProdOrderPos;
use App\Models\SectionActivatable;
use App\Models\Tool;
use App\Traits\ProdOrderPosOperations;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Services\CapacityPlanService;
use Throwable;

class ProdOrderPosOperationController extends Controller
{
    use ProdOrderPosOperations;

    public function getProdOrderWithProdLot(Request $request, Hall $hall)
    {
        $prodOrder = ProdOrderPosOperation::with("prodLot", "prodLot.machine.machineGroup", "prodOrderPos.prodOrder", "prodOrderPos.calculation.offerPos.offerPosRawDimensions", "prodOrderPos.calculation.offerPos.material", "prodOrderPos.calculation.heatTreatments", "prodOrderPos.calculation.operationPlan.operationPlanPos.operationPlanPosHeatTreatments", "prodOrderPos.item", "machineGroup")->whereRelation("machineGroup", "hall_id", $hall->id)->orderBy("id", "desc")->where('pos', '!=', '0390');

        $prodOrderCustomId = $request->input("prod_order_custom_id");
        $prodLotCustomId = $request->input("prod_lot_custom_id");
        $startDateSap = $request->input("start_date_sap");
        $prodLotStart = $request->input("prod_lot_start");
        $machineGroup = $request->input("machine_group");
        $machine = $request->input("machine");
        $name = $request->input("name");
        $item = $request->input("item");
        $linkedOrders = $request->input("linked_orders");
        $showOpenOrders = $request->input('show-open-orders');
        $material = $request->input('material');
        $materialType = $request->input('material_type');
        $productType = $request->input('product_type');
        $top = $request->input("\$top");
        $skip = $request->input("\$skip");


        if ($prodOrderCustomId) {
            $this->buildQueryInRelation($prodOrderCustomId, $prodOrder, "prodOrderPos.prodOrder", "custom_id");
        }

        if ($name) {
            $prodOrder = $prodOrder->where("name", "like", "%{$name}%");
        }

        if ($prodLotCustomId) {
            $this->buildQueryInRelation($prodLotCustomId, $prodOrder, "prodLot", "custom_id");
        }

        if ($startDateSap) {
            $prodOrder = $prodOrder->whereDate("start", "<=", $startDateSap);
        }

        if ($prodLotStart) {
            $this->buildQueryInRelation($prodLotStart, $prodOrder, "prodLot", "start", "<=", true);
        }

        if ($machineGroup) {
            $this->buildQueryInRelation($machineGroup, $prodOrder, "machineGroup", "id", "=", false);
        }

        if ($linkedOrders) {
            $this->buildQueryInRelation("%{$linkedOrders}%", $prodOrder, "prodOrderPos.calculation", "note_linked_operations", "like", false);
        }

        if ($machine) {
            $this->buildQueryInRelation($machine, $prodOrder, "prodLot.machine", "id", "=", false);
        }

        if ($item) {
            $this->buildQueryInRelation($item, $prodOrder, "prodOrderPos.item", "name", "=", false);
        }

        if ($material) {
            $this->buildQueryInRelation("%{$material}%", $prodOrder, "prodOrderPos.calculation.offerPos.material", "name", "like", false);
        }

        if ($materialType) {
            $this->buildQueryInRelation("%{$materialType}%", $prodOrder, "prodOrderPos.calculation.offerPos.material", "material_group_type", "like", false);
        }

        if ($productType) {
            $this->buildQueryInRelation("%{$productType}%", $prodOrder, "prodOrderPos.calculation.offerPos", "product_type", "like", false);
        }

        if ($top) {
            $prodOrder = $prodOrder->take($top);
        }

        if ($skip) {
            $prodOrder = $prodOrder->skip($skip);
        }

        if ($showOpenOrders == null || $showOpenOrders == true) {
            $prodOrder = $prodOrder->where('status', '!=', ProdOrderPosOperationStatus::CLOSED());
        } else {
            $prodOrder = $prodOrder->where('status', '=', ProdOrderPosOperationStatus::CLOSED());
        }

        $prodOrder = $prodOrder->get();
        return Response::json(["value" => $prodOrder]);
    }

    private function buildQueryInRelation($value, $entity, $mapping, $fieldname, $filterOperator = "like", $isDate = false)
    {
        $arr = explode(',', $value);

        $entity = $entity->whereHas($mapping, function ($query) use ($arr, $fieldname, $filterOperator, $isDate) {
            foreach ($arr as $key => $element) {
                if ($key == 0) {
                    if ($isDate) {
                        $lastQuery = $query->whereDate($fieldname, $filterOperator, $filterOperator == "like" ? "%{$element}%" : $element);
                    } else {
                        $lastQuery = $query->where($fieldname, $filterOperator, $filterOperator == "like" ? "%{$element}%" : $element);
                    }
                } else {
                    if ($isDate) {
                        $lastQuery->orWhereDate($fieldname, $filterOperator, $filterOperator == "like" ? "%{$element}%" : $element);
                    } else {
                        $lastQuery->orWhere($fieldname, $filterOperator, $filterOperator == "like" ? "%{$element}%" : $element);
                    }
                }
            }
        });
    }

    public function getOperationDetails(Request $request)
    {
        try {
            $results = $this->getProdOrderPosOperations($request);

            if ($results->isEmpty()) {
                return response()->json([]);
            }

            $lotIds = [];
            foreach ($results as $operation) {
                $lotIds[] = $operation->prod_lot_id;
            }

            $operationsForLot = ProdOrderPosOperation::whereIn('prod_lot_id', $lotIds)
                ->select('id', 'te', 'prod_lot_id', 'tr')
                ->get();


            $machine_id = $results->firstOrFail()->machine_id;

            // Capacity for a machine
            $machine = Machine::with([
                'capacities' => function ($query) {
                    $query->with(['shift'])->where('date', '>=', Carbon::today())->orderBy('date', 'asc');
                }
            ])->where('id', $machine_id)->select('id', 'custom_id', 'machine_board_hours')->first();

            $formattedValues = [];
            foreach ($results as $operation) {
                $goodItems = 0;
                $badItems = 0;
                $reworkItems = 0;

                // Good / Bad part calculation
                foreach ($operation->prodOrderPosOperationQuantities as $operationQuantity) {
                    $itemStateType = $operationQuantity->itemState->item_state_type;

                    switch ($itemStateType) {
                        case ItemStateType::SCRAP():
                            $badItems += $operationQuantity->quantity ?? 0;
                            break;
                        case ItemStateType::GOOD():
                            $goodItems += $operationQuantity->quantity ?? 0;
                            break;
                        default:
                            $reworkItems += $operationQuantity->quantity ?? 0;
                            break;
                    }
                }

                // Calculate expected end date
                $prodOrderPosOperationTime = $operation->prodOrderPosOperationTimes->where('end', null)->first();
                $effectiveStartTime = optional($prodOrderPosOperationTime)->start;
                $itemPackaging = optional($prodOrderPosOperationTime)->itemPackaging;
                $residualQuantity = ($operation->prodOrderPos->quantity - $goodItems);
                $totalTimeNeededForResidualQuantity = $residualQuantity * $operation->te;


                //Current cycle calculation
                $minTime = now()->subHours($machine->machine_board_hours ?? 1);

                $sumCycles = DB::table('machine_cycles')
                    ->where('machine_id', $machine->id)
                    ->where(function ($query) use ($operation) {
                        $query->where('prod_order_pos_operation_id', $operation->id)
                            ->orWhereNull('prod_order_pos_operation_id');
                    })
                    ->where('registered_datetime', '>', $minTime)
                    ->sum('quantity') ?: 1;

                $sumTime = DB::table('machine_machine_state_times')
                    ->leftJoin('machine_states', 'machine_machine_state_times.machine_state_id', '=', 'machine_states.id')
                    ->leftJoin('machine_state_groups', 'machine_states.machine_state_group_id', '=', 'machine_state_groups.id')
                    ->where('machine_machine_state_times.machine_id', $machine->id)
                    ->where(function ($query) use ($minTime) {
                        $query->where('machine_machine_state_times.end', '>', $minTime)
                            ->orWhereNull('machine_machine_state_times.end');
                    })
                    ->where('machine_state_groups.is_productive', true)
                    ->selectRaw('SUM(EXTRACT(EPOCH FROM (COALESCE(machine_machine_state_times.end, NOW()) - GREATEST(machine_machine_state_times.start, ?)))) as time',
                        [$minTime])
                    ->value('time');

                $expectedEndDateResponse = $this->calculateExpectedEndDate(optional($machine->first())->capacities, $totalTimeNeededForResidualQuantity, $residualQuantity);
                $orderProgress = ($operation->prodOrderPos->quantity > 0) ? ($goodItems / $operation->prodOrderPos->quantity) * 100 : 0;
                $effectiveTime = $this->getEffectiveTime($operation);

                $itemPlant = $operation->prodOrderPos?->item?->itemPlants?->first(function ($itemPlant) use ($operation) {
                    return $itemPlant->plant_id == optional($operation->prodOrderPos?->prodOrder)->plant_id_production;
                });

                $lastStartProduction = null;

                if(optional($prodOrderPosOperationTime)->status == ProdOrderPosOperationStatus::IN_PRODUCTION()){
                  $times = $operation->prodOrderPosOperationTimes()
                        ->orderByDesc('start')
                        ->get();

                    if ($times->count() > 1) {
                        foreach ($times as $key => $record) {
                            if ($record['status'] == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                                if ($key < $times->count() - 1 && $times[$key + 1]['status'] != ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                                    $lastStartProduction = $record['start'];
                                    break;
                                }
                            }
                        }
                    } else {
                        $lastStartProduction = $times[0]['start'];
                    }
                }


                $tearDownTime = match (ProdOrderPosOperationStatus::tryFrom($prodOrderPosOperationTime?->status)) {
                    ProdOrderPosOperationStatus::IN_TEARDOWN(), ProdOrderPosOperationStatus::IN_SETUP() => $operation->prodOrderPosOperationTimes()->whereIn('status', [ProdOrderPosOperationStatus::IN_TEARDOWN(), ProdOrderPosOperationStatus::IN_SETUP()])->select('id', 'start', 'end', 'machine_id', 'prod_order_pos_operation_id')->get(),
                    default => [],
                };

                $standardVelocity = 60 / (($operation->te > 0 ? $operation->te : 1) * ($operation->cavity > 0 ? $operation->cavity : 1));
                $currentCycle = ($sumCycles > 0 ? $sumTime / $sumCycles : 1);
                $currentVelocity = ($currentCycle > 0 ? 60 / $currentCycle : 0);

                $formattedValue = [
                    'id' => $operation->id,
                    'prodOrderId' => optional($operation->prodOrderPos->prodOrder)->id,
                    'prodOrderCustomId' => optional($operation->prodOrderPos->prodOrder)->custom_id,
                    'prodOrderPosOperationPosition' => $operation->pos,
                    'prodOrderPosOperationName' => $operation->name,
                    'itemId' => optional($operation->prodOrderPos->item)->custom_id,
                    'itemImageId' => optional($operation->prodOrderPos->item)->id,
                    'itemName' => optional($operation->prodOrderPos->item)->name,
                    'expectedEndTime' => $operation->end,
                    'orderQuantity' => $operation->prodOrderPos->quantity,
                    'goodItemsCount' => $goodItems,
                    'badItemsCount' => $badItems,
                    'reworkItemsCount' => $reworkItems,
                    'standardCycle' => $operation->prod_lot_id ? $this->getSumOfTE($operation->prod_lot_id, $operationsForLot) : $operation->te,
                    'setupTime' => $operation->prod_lot_id ? $this->getSumOfTR($operation->prod_lot_id, $operationsForLot) : $operation->tr,
                    'standardVelocity' => $standardVelocity,
                    'currentCycle' => $currentCycle,
                    'currentVelocity' => $currentVelocity,
                    'isLinkedOrder' => $operation->prod_lot_id,
                    'orderProgression' => intval($orderProgress),
                    'residualQuantity' => $residualQuantity,
                    'residualQuantityDetails2' => $residualQuantity - $reworkItems,
                    'scheduledStartTime' => $operation->start,
                    'effectiveStartTime' => $effectiveStartTime,
                    'scheduledEndTime' => $operation->end,
                    'lastProgression' => optional($operation->prodOrderPosOperationQuantities->first())->confirmed_datetime,
                    'expectedEndTimeWithCapacity' => $expectedEndDateResponse['end_date'] ?? null,
                    'expectedEndTimeWithCapacityErrorCode' => $expectedEndDateResponse['errorCode'] ?? null,
                    'unitOfMeasureCustomId' => optional($operation->unitOfMeasure)->custom_id,
                    'status' => optional($prodOrderPosOperationTime)->status,
                    'operationTimeStart' => optional($prodOrderPosOperationTime)->status == ProdOrderPosOperationStatus::IN_PRODUCTION() ? ($lastStartProduction ?? optional($prodOrderPosOperationTime)->start) : optional($prodOrderPosOperationTime)->start,
                    'packagingInstructionId' => optional($operation->prodOrderPos->item)->packaging_instruction_id,
                    'packagingInstructionId1' => optional($operation->prodOrderPos->item)->packaging_instruction_id_1,
                    'packagingInstructionId2' => optional($operation->prodOrderPos->item)->packaging_instruction_id_2,
                    'packagingInstructionId3' => optional($operation->prodOrderPos->item)->packaging_instruction_id_3,
                    'packagingInstructionId4' => optional($operation->prodOrderPos->item)->packaging_instruction_id_4,
                    'itemPackaging' => [
                        "id" => optional($itemPackaging)->id,
                        "custom_id" => optional($itemPackaging)->custom_id,
                    ],
                    'effectiveTime' => $effectiveTime,
                    'loadedQuantities' => $operation->prodOrderPosOperationLoadedQuantities->sum('quantity') ?? 0,
                    'itemPlantId' => $itemPlant?->id,
                    'tearDownTime' => $tearDownTime,
                ];

                $formattedValues[] = $formattedValue;
            }

            return response()->json($formattedValues);
        } catch (Throwable $th) {
            return response()->json(['error' => $th->getMessage()]);
        }
    }

    private function getEffectiveTime($operation)
    {
        $totalTime = 0;
        $operation->prodOrderPosOperationTimes->filter(function ($operationTime) use (&$totalTime) {
            $startTime = Carbon::parse($operationTime->start);
            $endTime = $operationTime->end ? Carbon::parse($operationTime->end) : Carbon::now();
            $totalTime += $startTime->diffInSeconds($endTime);
        });

        $totalQty = 0;
        $operation->prodOrderPosOperationQuantities->filter(function ($operationQuantity) use (&$totalQty) {
            $totalQty += $operationQuantity->quantity;
        });
        $totalQty = $totalQty == 0 ? 1 : $totalQty;

        return round(($totalTime / $totalQty), 2);
    }

    private function getSumOfTE($lotId, $operationsForLot)
    {
        // Filter the operations to include only those matching the given lotId
        $filteredOperations = $operationsForLot->filter(function ($operation) use ($lotId) {
            return $operation['prod_lot_id'] == $lotId;
        });

        // Calculate the sum of 'te' from the filtered operations
        $sumOfTE = $filteredOperations->sum('te');

        return $sumOfTE;
    }

    private function getSumOfTR($lotId, $operationsForLot)
    {
        $filteredOperations = $operationsForLot->filter(function ($operation) use ($lotId) {
            return $operation['prod_lot_id'] == $lotId;
        });

        $sumOfTR = $filteredOperations->sum('tr');

        return $sumOfTR;
    }

    private function getDifferenceInSeconds($datetime1, $datetime2)
    {
        $date1 = new DateTime($datetime1);
        $date2 = new DateTime($datetime2);
        $interval = $date1->getTimestamp() - $date2->getTimestamp();
        return abs($interval);
    }

    private function calculateExpectedEndDate($capacityArray, $totalSecondsOfWork, $residualQuantity)
    {
        $totalWorkSeconds = $totalSecondsOfWork;
        $workDoneToday = false;

        if ($totalWorkSeconds > 0) {
            foreach ($capacityArray as $dayCapacity) {
                $day = Carbon::parse($dayCapacity['date']);

                if ($dayCapacity['shift']) {
                    $shift = $dayCapacity['shift'];

                    // Parse the shift start and end times
                    $shiftStart = Carbon::parse($day->toDateString() . ' ' . $shift['start_time']);
                    $shiftEnd = Carbon::parse($day->toDateString() . ' ' . $shift['end_time']);

                    // Handle shifts that span past midnight
                    if ($shiftEnd->lessThan($shiftStart)) {
                        $shiftEnd->addDay();
                    }

                    // Recalculate shift duration
                    $shiftDurationInSeconds = $shiftStart->diffInSeconds($shiftEnd) - ($shift['break_minutes'] * 60);

                    if (!$workDoneToday && $day->isToday()) {
                        // Calculate remaining time for today's shift
                        $currentTime = Carbon::now();
                        if ($currentTime->greaterThan($shiftStart) && $currentTime->lessThan($shiftEnd)) {
                            $remainingShiftTimeToday = $shiftEnd->diffInSeconds($currentTime);
                            if ($remainingShiftTimeToday >= $totalWorkSeconds) {
                                return [
                                    'end_date' => $currentTime->addSeconds($totalWorkSeconds)->toDateTimeString(),
                                    'errorCode' => '',
                                ];
                            }
                            $totalWorkSeconds -= $remainingShiftTimeToday;
                            $workDoneToday = true;
                        }
                    } else {
                        if ($shiftDurationInSeconds >= $totalWorkSeconds) {
                            return [
                                'end_date' => $shiftStart->addSeconds($totalWorkSeconds)->toDateTimeString(),
                                'errorCode' => '',
                            ];
                        }
                        $totalWorkSeconds -= $shiftDurationInSeconds;
                    }
                }
            }

            // In case the work cannot be finished within the provided capacities
            return [
                'end_date' => '',
                'errorCode' => 'NOT_ENOUGH_CAPACITY',  // Error code for not enough capacity
            ];
        } else if ($residualQuantity <= 0) {
            // In case residual quantity is zero
            return [
                'end_date' => '',
                'errorCode' => 'OPERATION_COMPLETED',  // Error code for order completion
            ];
        } else {
            return [
                'end_date' => Carbon::now()->format('Y-m-d H:i:s'),
                'errorCode' => null,
            ];
        }
    }

    public function getPlannedOrder(Request $request)
    {
        $start = $request->input("start") ? Carbon::parse($request->input("start")) : Carbon::now();
        $end = $request->input("end") ? Carbon::parse($request->input("end")) : Carbon::now()->addDays(7);
        $isShowProposedData = $request->input('isShowProposedData');

        $customers = $request->customers;
        $items = $request->items;
        $prodOrders = $request->prodOrders;
        $halls = $request->halls;
        $machineIds = $request->machineIds;

        $operations = ProdOrderPosOperation::with([
            'prodOrderPos' => function ($query) {
                $query->select('id', 'prod_order_id', 'pos', 'item_id', 'quantity', 'is_production_possible', 'due_date', 'release_date', 'batch');
            },
            'prodOrderPos.item' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            },
            'prodOrderPos.item.customers' => function ($query) use ($customers) {
                $query->select('customers.id', 'customer_id', 'name');
            },
            'prodOrderPos.prodOrder',
            'tool',
            'machine' => function ($query) {
                $query->select('id', 'custom_id', 'name', 'hall_id', 'usage_factor');
            },
            'machineGroup',
            'prodOrderPosOperationAltMachines.machine',
            'prodOrderPosOperationResources.item' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            },
            'prodOrderPosOperationQuantities'
        ])
        ->when($customers, function ($query) use ($customers) {
            $query->whereHas('prodOrderPos.item.customers', function ($query) use ($customers) {
                $query->whereIn('customers.id', $customers);
            });
        }) 
        ->select('id', 'has_labels_prepared','has_components_prepared', 'teardown_time', 'component_availability', 'te', 'tr', 'prod_order_pos_id', 'name', 'pos', 'start', 'end', 'plan_start', 'plan_end', 'machine_id', 'plan_machine_id', 'tool_id', 'tool_reference_nr', 'show_in_planvisu', 'machine_group_id', 'status', 'quantity', 'cavity', 'operation_code', 'lead_time_days', 'constraint_type', 'registered_quantity')
            ->where('end', "!=", null)
            ->where('start', "!=", null)->where('machine_id', "!=", null)
            ->where('show_in_planvisu', '=', true)
            ->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())
            ->where('status', '!=', ProdOrderPosOperationStatus::DELETED());

        if ($isShowProposedData === 'true') {
            $operations->where('status', '!=', ProdOrderPosOperationStatus::PROPOSED());
        }

        if (empty($prodOrders) && empty($items)) {
            $operations->where('end', '>=', $start)
                ->where('start', '<=', $end);
        }

        if (!empty($items)) {
            $operations->whereHas('prodOrderPos.item', function ($query) use ($items) {
                $query->whereIn('id', $items)->orWhereIn('custom_id', $items);
            });
        }

        if (!empty($halls) && empty($prodOrders) && empty($items)) {
            $operations->whereHas('machine.hall', function ($query) use ($halls) {
                $query->whereIn('id', $halls);
            });
        }
        if (!empty($machineIds) && empty($prodOrders) && empty($items)) {
            $operations->whereIn('machine_id', $machineIds);
        }

        if (!empty($prodOrders)) {
            $operations->whereHas('prodOrderPos.prodOrder', function ($query) use ($prodOrders) {
                $query->whereIn('id', $prodOrders)
                    ->orWhereIn('custom_id', $prodOrders);
            });
        }

        $operations = $operations->get()->map(function ($item) {
            $item->restrictions = $this->checkRestrictions($item);
            $item->produced_quantity = $this->getProducedQty($item);

            return $item;
        });


        return response()->json($operations);
    }

    private function getProducedQty($item)
    {
        return env('V10_ENABLED') ? $item->registered_quantity : $item->prodOrderPosOperationQuantities->where('machine_id', $item->machine_id)->sum('quantity');
    }

    /**
     * Usage of tools at the same time in different operations
     * Conflict between Due date and end date of the last operation operation
     * Following operations have start date before end date of the privious operation
     * @param \App\Models\ProdOrderPosOperation $prodOrderPosOperation
     * @return void
     */
    private function checkRestrictions(ProdOrderPosOperation $prodOrderPosOperation): array
    {
        return [
            "tool_restriction" => $this->toolRestriction($prodOrderPosOperation),
            "due_date_restriction" => $this->checkDueDateRestriction($prodOrderPosOperation),
            "overlapping_restriction" => $this->checkOperationStartsBeforePreviousEnd($prodOrderPosOperation),
            "tool_status" => $this->toolStatusRestrictionCheck($prodOrderPosOperation)
        ];
    }

    public function updateConstrainedOperation($prodOrderPosOperationId)
    {
        $prodOrderPosOperation = ProdOrderPosOperation::where('id', $prodOrderPosOperationId)->with('prodOrderPos', 'machine')->first();

        if ($prodOrderPosOperation->constraint_type != MachineConstraintType::CONSTRAINT()) {
            return;
        }

        $allOperations = ProdOrderPosOperation::with('prodOrderPos', 'machine')->where('prod_order_pos_id', $prodOrderPosOperation->prod_order_pos_id)->orderBy('pos')->get();

        $index = $allOperations->search(function ($item, $key) use ($prodOrderPosOperation) {
            return $item->id == $prodOrderPosOperation->id;
        });

        $nextStart = Carbon::parse($prodOrderPosOperation->start);

        // backward
        for ($i = $index - 1; $i > -1; $i--) {
            $operation = $allOperations->get($i);
            if ($operation->constraint_type != MachineConstraintType::BACKWARD()) {
                break;
            }

            $quantity = $operation->send_ahead_quantity > 0 ? $operation->send_ahead_quantity : $operation->prodOrderPos->quantity;
            $nextDuration = ((($operation->te) / ($operation->cavity)) * $quantity) + ($operation->lead_time_days * 86400);

            $capacityService = new CapacityPlanService();
            $currentStart = $capacityService->calculateStartTime($nextStart->toISOString(), $nextDuration, $operation->machine_id)['start'];

            $currentDuration = ((($operation->te) / ($operation->cavity)) * $operation->prodOrderPos->quantity);
            $currentEnd = $capacityService->calculateEndTime($currentStart->toISOString(), $currentDuration, $operation->machine_id)['end'];

            $operation->start = $currentStart;
            $operation->end = $currentEnd;
            $operation->plan_start = $currentStart;
            $operation->plan_end = $currentEnd;

            $operation->save();

            $nextStart = $currentStart;
        }

        $prevStart = Carbon::parse($prodOrderPosOperation->start);
        $prevOperation = $prodOrderPosOperation;
        // forward
        for ($i = $index + 1; $i < $allOperations->count(); $i++) {
            $operation = $allOperations->get($i);

            if ($operation->constraint_type != MachineConstraintType::FORWARD()) {
                break;
            }

            $quantity = $prevOperation->send_ahead_quantity > 0 ? $prevOperation->send_ahead_quantity : $prevOperation->prodOrderPos->quantity;
            $prevDuration = ((($prevOperation->te) / ($prevOperation->cavity)) * $quantity) + ($prevOperation->lead_time_days * 86400);

            $capacityService = new CapacityPlanService();
            $currentStart = $capacityService->calculateEndTime($prevStart->toISOString(), $prevDuration, $prevOperation->machine_id)['end'];

            $currentDuration = ((($operation->te) / ($operation->cavity)) * $operation->prodOrderPos->quantity);
            $currentEnd = $capacityService->calculateEndTime($currentStart->toISOString(), $currentDuration, $operation->machine_id)['end'];

            $operation->start = $currentStart;
            $operation->end = $currentEnd;
            $operation->plan_start = $currentStart;
            $operation->plan_end = $currentEnd;

            $operation->save();

            $prevStart = $currentStart->clone();
            $prevOperation = $operation;
        }

    }

    public function getConstraingedOperationDate(Request $request)
    {
        $pos = $request->input('pos');
        $quantity = $request->input('quantity');
        $constraintType = $request->input('constraint_type');
        $start = Carbon::parse($request->input('start'));
        $allOperations = collect($request->input('operations'))->sortBy('pos');

        if ($constraintType != MachineConstraintType::CONSTRAINT()) {
            return [];
        }

        $allUpdatedOperations = [];

        $index = $allOperations->search(function ($item, $key) use ($pos) {
            return $item['pos'] == $pos;
        });

        $nextStart = $start->clone();

        // backward
        for ($i = $index - 1; $i > -1; $i--) {
            $operation = $allOperations->get($i);
            if ($operation['constraint_type'] != MachineConstraintType::BACKWARD()) {
                break;
            }

            $quantity = $operation['send_ahead_quantity'] > 0 ? $operation['send_ahead_quantity'] : $quantity;
            $nextDuration = ((($operation['te']) / ($operation['cavity'])) * $quantity) + ($operation['lead_time_days'] * 86400);

            $capacityService = new CapacityPlanService();
            $currentStart = $capacityService->calculateStartTime($nextStart->toISOString(), $nextDuration, $operation['machine']['id'])['start'];

            $currentDuration = ((($operation['te']) / ($operation['cavity'])) * $quantity);
            $currentEnd = $capacityService->calculateEndTime($currentStart->toISOString(), $currentDuration, $operation['machine']['id'])['end'];

            $allUpdatedOperations[] = [
                'start' => $currentStart->clone(),
                'end' => $currentEnd->clone(),
                'pos' => $operation['pos']
            ];


            $nextStart = $currentStart->clone();
        }

        $prevStart = $start->clone();
        $prevOperation = $allOperations->get($index);
        // forward
        for ($i = $index + 1; $i < $allOperations->count(); $i++) {
            $operation = $allOperations->get($i);
            
            if ($operation['constraint_type'] != MachineConstraintType::FORWARD()) {
                break;
            }

            $quantity = $prevOperation['send_ahead_quantity'] > 0 ? $prevOperation['send_ahead_quantity'] : $quantity;
            $prevDuration = ((($prevOperation['te']) / ($prevOperation['cavity'])) * $quantity) + ($prevOperation['lead_time_days'] * 86400);

            $capacityService = new CapacityPlanService();
            $currentStart = $capacityService->calculateEndTime($prevStart->toISOString(), $prevDuration, $prevOperation['machine']['id'])['end'];

            $currentDuration = ((($operation['te']) / ($operation['cavity'])) * $quantity);
            $currentEnd = $capacityService->calculateEndTime($currentStart->toISOString(), $currentDuration, $operation['machine']['id'])['end'];
            
            $allUpdatedOperations[] = [
                'start' => $currentStart->clone(),
                'end' => $currentEnd->clone(),
                'pos' => $operation['pos']
            ];

            $prevStart = $currentStart->clone();
            $prevOperation = $operation;
        }

        return $allUpdatedOperations;
    }

    private function toolStatusRestrictionCheck($prodOrderPosOperation)
    {
        $tool_id = $prodOrderPosOperation->tool_id;
        if (!isset($tool_id)) {
            return [
                "status" => ToolRepairStatus::READY_FOR_USE()
            ];
        }

        $tool = Tool::where("id", "=", $tool_id)->select("id", "custom_id")->first();
        $item = Item::where("custom_id", "=", $tool->custom_id)->select("id", "custom_id")->first();


        $itemController = new ItemController();
        $result = $itemController->getToolRepairStatuses(json_encode([$item->id]));
        return $result['0'];
    }

    private function checkOperationStartsBeforePreviousEnd(ProdOrderPosOperation $prodOrderPosOperation)
    {
        $prodOrderPosOperations = ProdOrderPosOperation::where("prod_order_pos_id", "=", $prodOrderPosOperation->prod_order_pos_id)->whereRelation("operationControlProfile", "confirmation_type", "=", OperationControlProfileConfirmationType::MILESTONE)->get()->sortBy(function ($item) {
            // Extract the numeric part after the underscore
            $lastPart = Str::afterLast($item['pos'], '_');
            return (int) $lastPart ?? 0;
        });

        foreach ($prodOrderPosOperations as $prodOrderPosOperation2) {
            if ($prodOrderPosOperation2->pos == $prodOrderPosOperation->pos) {
                break;
            }

            $previousEnd = Carbon::parse($prodOrderPosOperation2->end);
            $currentStart = Carbon::parse($prodOrderPosOperation->start);

            if ($previousEnd->gt($currentStart)) {
                return [
                    "status" => true,
                    "data" => $prodOrderPosOperation2
                ];
            }

        }


        return [
            "status" => false
        ];
    }

    private function checkDueDateRestriction(ProdOrderPosOperation $prodOrderPosOperation)
    {
        if (!isset($prodOrderPosOperation->prodOrderPos->due_date)) {
            return [
                "status" => false
            ];
        }
        $duedate = Carbon::parse($prodOrderPosOperation->prodOrderPos->due_date);

        $prodOrderPosOperations = ProdOrderPosOperation::where("prod_order_pos_id", "=", $prodOrderPosOperation->prod_order_pos_id)->get()->filter(function ($operation) {
            $isActive = SectionActivatable::where('section', SectionActivatableTypes::PLANVISU())->where('activatable_id', $operation->machine_id)->where('activatable_type', Machine::class)->where('is_active', true)->first();
            if (isset($isActive)) {
                return true;
            } else {
                return false;
            }
        });

        foreach ($prodOrderPosOperations as $prodOrderPosOperation2) {
            $endDate = Carbon::parse($prodOrderPosOperation2->end);
            if ($endDate->gt($duedate)) {
                return [
                    "status" => true,
                    "data" => $prodOrderPosOperation2
                ];
            }
        }

        return [
            "status" => false
        ];
    }

    private function toolRestriction(ProdOrderPosOperation $prodOrderPosOperation)
    {
        //not tool id available
        if (!isset($prodOrderPosOperation->tool_id)) {
            return [
                "status" => false
            ];
        }

        $orderItem = Item::where("custom_id", "=", $prodOrderPosOperation->tool->custom_id)->first();

        if (!isset($orderItem->main_tool_id)) {
            return [
                "status" => false
            ];
        }


        $items = Item::where("main_tool_id", "=", $orderItem->main_tool_id)->select("custom_id")->get()->pluck("custom_id");
        $toolIds = Tool::whereIn("custom_id", $items)->select("id")->pluck("id");

        $foundOperation = ProdOrderPosOperation::with('prodOrderPos.prodOrder', 'tool')
            ->whereIn("tool_id", $toolIds)
            ->where("status", "<>", ProdOrderPosOperationStatus::CLOSED())
            ->where("status", "<>", ProdOrderPosOperationStatus::DELETED())
            ->where("id", "<>", $prodOrderPosOperation->id)
            ->where(function ($query) use ($prodOrderPosOperation) {
                $query->orWhere(function ($query) use ($prodOrderPosOperation) {
                    // Case 1: Existing operation's start or end falls within the new operation's range
                    $query->whereBetween("start", [Carbon::parse($prodOrderPosOperation->start)->addSecond(), Carbon::parse($prodOrderPosOperation->end)->subSecond()])
                        ->orWhereBetween("end", [Carbon::parse($prodOrderPosOperation->start)->addSecond(), Carbon::parse($prodOrderPosOperation->end)->subSecond()]);
                })->orWhere(function ($query) use ($prodOrderPosOperation) {
                    // Case 2: Existing operation completely contains the new operation
                    $query->where("start", "<=", Carbon::parse($prodOrderPosOperation->start)->addSecond())
                        ->where("end", ">=", Carbon::parse($prodOrderPosOperation->end)->subSecond());
                })->orWhere(function ($query) use ($prodOrderPosOperation) {
                    // Case 3: New operation completely contains the existing operation
                    $query->where("start", ">=", Carbon::parse($prodOrderPosOperation->start)->addSecond())
                        ->where("end", "<=", Carbon::parse($prodOrderPosOperation->end)->subSecond());
                });
            })
            ->first();

        if (isset($foundOperation)) {
            return [
                "status" => true,
                "data" => $foundOperation
            ];
        } else {
            return [
                "status" => false
            ];
        }

    }


    public function getUnPlannedOrder(Request $request)
    {
        $top = $request->input("top") ?? 100;
        $skip = $request->input("skip") ?? 0;
        // $halls = $request->halls;
        // $machineGroups = $request->machineGroups;
        $items = $request->items;
        $prodOrders = $request->prodOrders;
        // $statuses = $request->input("statuses"); 

        $operations = ProdOrderPosOperation::with([
            'prodOrderPos' => function ($query) {
                $query->select('id', 'prod_order_id', 'pos', 'item_id', 'quantity');
            },
            'prodOrderPos.item' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            },
            'prodOrderPos.prodOrder',
            'tool',
            'machine' => function ($query) {
                $query->select('id', 'custom_id', 'name', 'hall_id');
            },
            'machineGroup',
            'prodOrderPosOperationAltMachines.machine',
            'prodOrderPosOperationResources.item' => function ($query) {
                $query->select('id', 'custom_id', 'name');
            }
        ])->select(
                'id',
                'te',
                'prod_order_pos_id',
                'name',
                'pos',
                'start',
                'end',
                'plan_start',
                'status',
                'plan_end',
                'machine_id',
                'plan_machine_id',
                'tool_id',
                'show_in_planvisu',
                'machine_group_id',
                'quantity',
                'operation_code'
            );

        $operations
            ->where(function ($query) {
                $query->orWhere('end', null)->orWhere('start', null)->orWhere('machine_id', null);
            })
            ->where('show_in_planvisu', true)
            ->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())
            ->where('status', '!=', ProdOrderPosOperationStatus::DELETED());

        // if (!empty($halls)) {
        //     $operations->whereHas('machine', function ($query) use ($halls) {
        //         $query->whereIn('hall_id', $halls);
        //     });
        // }

        // if (!empty($machineGroups)) {
        //     $operations = $operations->whereIn('machine_group_id', $machineGroups);
        // }

        if (!empty($items)) {
            $operations->whereHas('prodOrderPos.item', function ($query) use ($items) {
                $query->whereIn('id', $items);
            });
        }

        if (!empty($prodOrders)) {
            $operations->whereHas('prodOrderPos.prodOrder', function ($query) use ($prodOrders) {
                $query->whereIn('id', $prodOrders);
            });
        }

        // if ($statuses) {
        //     $operations->whereIn('status', $statuses);
        // }

        $operations = $operations->skip($skip)->take($top)->get();

        return response()->json($operations);
    }

    public function getProdOrderPosOperationForTimeVisu(Request $request)
    {
        try {
            $data = ProdOrderPosOperation::with([
                'prodOrderPos:id,prod_order_id,release_date,status,status_plan,item_id,start,release_date,user_id_responsible,prod_order_id',
                'prodOrderPos.prodOrder:id,order_type,custom_id',
                'prodOrderPos.item:id,is_active,is_tool,custom_id,name',
                'prodOrderPos.userResponsible:id,is_active,custom_id,name',
                'prodOrderPos.media:id,model_id,disk,conversions_disk',
                'operationPlan'
            ])
                ->whereHas('prodOrderPos', function ($query) {
                    $query->where(function ($subQuery) {
                        $subQuery->whereNull('status')
                            ->orWhereNotIn('status', [ProdOrderPosOperationStatus::DELETED(), ProdOrderPosOperationStatus::CLOSED()]);
                    })
                        ->where(function ($subQuery) {
                            $subQuery->whereNull('status_plan')
                                ->orWhereNotIn('status_plan', [ProdOrderPosOperationStatus::DELETED(), ProdOrderPosOperationStatus::CLOSED()]);
                        })
                        ->whereHas('item', function ($itemQuery) {
                            $itemQuery->where('is_active', true)
                                ->where('is_tool', true);
                        });
                })
                ->whereHas('prodOrderPos.prodOrder', function ($query) {
                    $query->where('order_type', 'MAINTENANCE');
                })
                ->where(function ($query) {
                    $query->where('is_repair_completed', false)
                        ->orWhereNull('is_repair_completed');
                })
                ->select('prod_order_pos_id', 'id', 'name', 'pos', 'operation_plan_id_origin')
                ->get()
                ->map(function (ProdOrderPosOperation $item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'prod_order_pos_id' => $item->prod_order_pos_id,
                        'operationPlan' => [
                            'id' => $item->operationPlan?->id,
                            'custom_id' => $item->operationPlan?->custom_id,
                        ],
                        'prodOrderPos' => [
                            'id' => $item->prodOrderPos->id,
                            'prod_order_id' => $item->prodOrderPos->prod_order_id,
                            'release_date' => $item->prodOrderPos->release_date,
                            'start' => $item->prodOrderPos->start,
                            'status' => $item->prodOrderPos->status,
                            'status_plan' => $item->prodOrderPos->status_plan,
                            'user' => [
                                'id' => $item->prodOrderPos->userResponsible?->id,
                                'custom_id' => $item->prodOrderPos->userResponsible?->custom_id,
                                'name' => $item->prodOrderPos->userResponsible?->name,
                            ],
                            'prodOrder' => [
                                'id' => $item->prodOrderPos->prodOrder?->id,
                                'custom_id' => $item->prodOrderPos->prodOrder?->custom_id,
                                'order_type' => $item->prodOrderPos->prodOrder?->order_type,
                            ],
                            'item' => [
                                'id' => $item->prodOrderPos->item->id,
                                'is_active' => $item->prodOrderPos->item?->is_active,
                                'is_tool' => $item->prodOrderPos->item?->is_tool,
                                'custom_id' => $item->prodOrderPos->item?->custom_id,
                                'name' => $item->prodOrderPos->item?->name,
                            ],
                            'media' => [...$item->prodOrderPos->media->toArray()]
                        ],
                    ];
                });


            return response()->json([
                'success' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching data.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function closeProdOrderPosOperation(ProdOrderPosOperation $prodOrderPosOperation)
    {
        try {
            DB::transaction(function () use ($prodOrderPosOperation) {

                if($prodOrderPosOperation->canCloseOperation()) {
                    // Handle operation time
                    MachineProdOrderPosOperationTime::whereNull('end')
                        ->where('prod_order_pos_operation_id', $prodOrderPosOperation->id)
                        ->update([
                            "end" => now(),
                        ]);
                    Log::info("" . $prodOrderPosOperation->prodOrderPos->prodOrder->custom_id . " - " . $prodOrderPosOperation->pos . " closed manually");
                    // Update operation status
                    $prodOrderPosOperation->update([
                        "status" => ProdOrderPosOperationStatus::CLOSED(),
                        "status_plan" => ProdOrderPosOperationStatus::CLOSED()
                    ]);

                    event(new OperationClosed($prodOrderPosOperation->machine, $prodOrderPosOperation));

                    return response()->json([
                        'success' => true,
                        'message' => 'Operation closed successfully.',
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Operation can not be closed. Please check open inspections',
                    ], 500);
                }
            });
        } catch (Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while closing the Operation.',
            ], 500);
        }
    }

    public function getProdOrderPosOperationForMachines(Request $request)
        {
            $isBacklog = $request->input("isBacklog");
            $start = Carbon::parse($request->start);
            $end = Carbon::parse($request->end);
            $hallIds = $request->hall_id;

            if ($isBacklog) {
                $start = Carbon::yesterday();
                $end = Carbon::yesterday();
            }

            // Define allowed statuses
            $allowedStatuses = [
                ProdOrderPosOperationStatus::PLANNED(),
                ProdOrderPosOperationStatus::PROPOSED(),
                ProdOrderPosOperationStatus::IN_SETUP(),
                ProdOrderPosOperationStatus::IN_PRODUCTION(),
                ProdOrderPosOperationStatus::SUSPENDED(),
                ProdOrderPosOperationStatus::TERMINATED()
            ];

            // Fetch machines with their related data
            $machines = Machine::with([
                'prodOrderPosOperations' => function ($query) use ($start, $end, $isBacklog, $allowedStatuses) {
                    $query->whereIn('status', $allowedStatuses)
                        ->when($isBacklog, fn($q) => $q->where('start', '<', Carbon::today()))
                        ->when(!$isBacklog, fn($q) => $q->whereBetween('start', [$start, $end]))
                        ->select([
                            'id', 'name', 'start', 'end', 'machine_id', 'status', 'prod_order_pos_id', 
                            'cavity', 'te', 'tool_id', 'item_id_tool', 'tr', 'pos', 'teardown_time'
                        ])
                        ->with([
                            'itemTool' => fn($q) => $q->where('is_active', true)
                                ->where('is_tool', true)
                                ->select('id', 'custom_id', 'name', 'is_active', 'is_tool'),
                            'prodOrderPos:id,prod_order_id,pos,quantity,item_id,due_date',
                            'prodOrderPos.prodOrder:id,custom_id',
                            'prodOrderPos.item:id,custom_id,name',
                            'prodOrderPosOperationAltMachines:id,prod_order_pos_operation_id,machine_id',
                            'prodOrderPosOperationAltMachines.machine:id,name',
                            'tool:id,custom_id,name'
                        ]);
                }
            ])
            ->whereHas('sectionActivatables', fn($q) => $q->where([
                ['activatable_type', Machine::class],
                ['is_active', true],
                ['section', SectionActivatableTypes::PLANVISU()]
            ]))
            ->whereIn('hall_id', $hallIds)
            ->select('id', 'name', 'custom_id', 'usage_factor', 'hall_id', 'sort_order')
            ->get()
            ->sortBy('sort_order');

            $filteredMachines = $machines->filter(fn($machine) => $machine->prodOrderPosOperations->isNotEmpty())->values();
            $data = collect([]);
            $condtion = true;
            $currentDate = $start;
            
            while ($currentDate->lessThanOrEqualTo($end)) { // Loop from start to end date
                $filteredMachinesData = collect();
                foreach ($filteredMachines as $value) {
                    $filteredOperations = $value->prodOrderPosOperations->filter(function ($operation) use ($currentDate) {
                        return Carbon::parse($operation->start)->format('Y-m-d') == $currentDate->format('Y-m-d');
                    })->values();
                    
                    $value->data = $filteredOperations;
                    if ($filteredOperations->isNotEmpty()) {
                        $filteredMachinesData->push($value);
                    }
                }
                $data->push([
                    'startDate' => $currentDate->format('Y-m-d'),
                    'filteredMachines' => $filteredMachinesData->toArray(),
                ]);

                if($currentDate->format('Y-m-d')==$start){
                    $condtion = false;
                }

                // Increment the date by one day
                $currentDate->addDay();
            }

            return response()->json([
                'data' => $data
            ]);
    }

    function getMaintenanceHistoryCount(Request $request)
    {
        $prodOrderPos = ProdOrderPos::select('id', 'prod_order_id', 'start', 'end')
            ->whereHas('prodOrder', function ($query) {
                $query->where('order_type', ProdOrderType::MAINTENANCE());
            })
            ->whereHas('prodOrderPosOperations', function ($query) {
                $query->where('status', ProdOrderPosOperationStatus::CLOSED());
            })
            ->with([
                'prodOrderPosOperations',
                'prodOrder:id,custom_id'
            ])
            ->get();

        $filteredProdOrderPos = $prodOrderPos->filter(function ($pop) use ($request) {
            $customId = $request->input('$search');
            $matchesCustomId = !$customId || Str::contains($pop->prodOrder->custom_id, $customId);

            return $this->checkStatus($pop->prodOrderPosOperations) && $matchesCustomId;
        });

        return response()->json(['count' => $filteredProdOrderPos->count()]);
    }

    function checkStatus($operations)
    {
        foreach ($operations as $operation) {
            if ($operation['status'] != ProdOrderPosOperationStatus::CLOSED()) {
                return false;
            }
        }
        return true;
    }

    public function getDurationForCreateOrder(Request $request)
    {
        $operations = collect($request->input('operations'))->sortBy('pos');
        $endDate = Carbon::parse($request->input('due_date'));

        $dates = collect([]);

        foreach ($operations->reverse() as $index => $operation) {

            $leadTimeDays = $operation['lead_time_days'];
            if ($index != $operations->count() - 1) {
                $nextOperation = $operations->get($index + 1);
            }

            if ($leadTimeDays > 0) {
                $endDate = $endDate->subDays($leadTimeDays);
            }

            if ($operation['send_ahead_quantity'] > 0 && isset($nextOperation)) {
                $duration = ($operation['te'] / $operation['cavity']) * $operation['quantity'];
                $durationForSendAHeadQuantity = ($operation['te'] / $operation['cavity']) * $operation['send_ahead_quantity'];
                $capacityPlanService = new CapacityPlanService();
                $start = $capacityPlanService->calculateStartTime($endDate->clone(), $durationForSendAHeadQuantity, $operation['machine_id'])['start'];
                $date = $capacityPlanService->calculateEndTime(Carbon::parse($start), $duration, $operation['machine_id']);

                $date['pos'] = $operation['pos'];
                $dates->push($date);
                $endDate = Carbon::parse($date['start']);

            } else {
                $duration = ($operation['te'] / $operation['cavity']) * $operation['quantity'];
                $capacityPlanService = new CapacityPlanService();

                $date = $capacityPlanService->calculateStartTime($endDate->clone(), $duration, $operation['machine_id']);

                $date['pos'] = $operation['pos'];

                $dates->push($date);
                $endDate = Carbon::parse($date['start']);

            }



        }



        return $dates->sortBy('pos')->values();
    }

    public function getOrdersForOrderView(Request $request)
    {
        $start = $request->input("start") ? Carbon::parse($request->input("start"))->format('Y-m-d 00:00:00') : Carbon::now()->format('Y-m-d 00:00:00');
        $end = $request->input("end") ? Carbon::parse($request->input("end"))->format('Y-m-d 23:59:59') : Carbon::now()->addDays(7)->format('Y-m-d 23:59:59');
        
        $prodOrders = explode(',', $request->input('prodOrders'));
        $items = explode(',', $request->input('items'));
        $machineGroups = explode(',', $request->input('machineGroups'));
      
        $inIt = $request->input('$inIt', '0');
        $status = (int) $request->input('status', 1);

        $halls = $inIt ? Hall::select('id')->first() : ($request->input('halls') ? explode(',', $request->input('halls')) : Hall::select('id')->pluck('id'));

        $top = $request->input("top") ?? 40;
        $skip = $request->input("skip") ?? 0;

        $operations = ProdOrderPosOperation::query()
            ->with([
                'prodOrderPos' => function ($query) {
                    $query->select('id', 'prod_order_id', 'pos', 'item_id', 'quantity', 'is_production_possible', 'due_date', 'release_date');
                },
                'prodOrderPos.item' => function ($query) {
                    $query->select('id', 'custom_id', 'name');
                },
                'prodOrderPos.prodOrder',
                'tool',
                'machine' => function ($query) {
                    $query->select('id', 'custom_id', 'name', 'hall_id', 'usage_factor', 'machine_group_id');
                },
                'machine.machineGroup' => function ($query) {
                    $query->select('id', 'name', 'custom_id');
                },
            ])
           
            ->when(!$prodOrders  && !$items, function ($query) use ($start, $end) {
               
                $query->where('start', '>=', $start)
                ->where('start', '<=', $end);
              
            })
            ->select('id', 'has_labels_prepared', 'teardown_time', 'component_availability', 'te', 'tr', 'prod_order_pos_id', 'name', 'pos', 'start', 'end', 'plan_start', 'plan_end', 'machine_id', 'plan_machine_id', 'tool_id', 'tool_reference_nr', 'show_in_planvisu', 'machine_group_id', 'status', 'quantity', 'cavity', 'operation_code', 'lead_time_days')
            ->when($status == 1, function ($query) {
                $query->where(function ($q) {
                    $q->where(function ($query) {
                        $query->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())->where('status', '!=', ProdOrderPosOperationStatus::DELETED());
                    })->orWhere(function ($query) {
                        $query->where('status_plan', '!=', ProdOrderPosOperationStatus::CLOSED())->where('status_plan', '!=', ProdOrderPosOperationStatus::DELETED());
                    });
                });
            })
            ->when($status == 0, function ($query) {
                $query->where(function ($q) {
                    $q->where(function ($query) {
                        $query->where('status', '=', ProdOrderPosOperationStatus::CLOSED())->where('status', '!=', ProdOrderPosOperationStatus::DELETED());
                    })->orWhere(function ($query) {
                        $query->where('status_plan', '=', ProdOrderPosOperationStatus::CLOSED())->where('status_plan', '!=', ProdOrderPosOperationStatus::DELETED());
                    });
                });
            });
        if ($request->input('items')) {
            $operations->whereHas('prodOrderPos.item', function ($query) use ($items) {
                $query->whereIn('items.id', $items)
                    ->orWhereIn('items.custom_id', $items);
            });
        }
        if ($request->input('machineGroups')) {
            $operations->whereHas('machine.machineGroup', function ($query) use ($machineGroups) {
                $query->whereIn('machine_groups.id', $machineGroups)
                    ->orWhereIn('machine_groups.custom_id', $machineGroups);
            });
        }
        if (!empty($halls) && empty(array_filter($prodOrders)) && empty(array_filter($items))) {
            $operations->whereHas('machine.hall', function ($query) use ($halls) {
                $query->whereIn('halls.id', $halls);
            });
        }
        if ($request->input('prodOrders')) {
            $operations = $operations->whereHas('prodOrderPos.prodOrder', function ($query) use ($prodOrders) {
                $query->whereIn('prod_orders.id', $prodOrders)
                    ->orWhereIn('prod_orders.custom_id', $prodOrders);
            });
        }

        $operations = $operations->skip($skip)->take($top)->get();

        return response()->json($operations);
    }
}
