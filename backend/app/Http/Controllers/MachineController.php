<?php

namespace App\Http\Controllers;

use App\Enums\StatusBoardCardType;

use App\Enums\MachineBoardStateType;
use App\Events\MachineStateChanged;
use Illuminate\Http\JsonResponse;
use App\Enums\MachineStateStateType;
use App\Enums\ProdOrderPosOperationStatus;
use App\Models\Machine;
use App\Models\MachineMachineStateTime;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Exception;
use App\Models\SectionActivatable;
use App\Enums\SectionActivatableTypes;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\Plant;
use App\Models\ProdOrderPosOperation;
use App\Traits\ProdOrderPosOperations;
use Illuminate\Support\Facades\Validator;

class MachineController extends Controller
{
    protected $prodOrderPosOperationController;
    use ProdOrderPosOperations;

    protected $qualificationController;

    public function __construct(QualificationController $qualificationController, ProdOrderPosOperationController $prodOrderPosOperationController = null)
    {
        $this->prodOrderPosOperationController = $prodOrderPosOperationController;
        $this->qualificationController = $qualificationController;
    }

    function getMachinesForStatusboard(Plant $plant)
    {
        $user = \auth()->user();
        $machines = Machine::with('machineUserRestrictions', 'hall', 'machineGroup', 'standardValueKey.standardValueKeyActivityTypes', 'sectionActivatables');
        if ($plant->id) {
            $machines = $machines->where('is_active', '=', true)->where('plant_id', $plant->id);
        }
        $machines = $machines->get();
        $allowedMachines = collect();
        foreach ($machines as $machine) {
            if (!($machine->machineVisibleForUser($user->id))) {
                continue;
            }

            // Rename standard_value_key to standardValueKey
            $machineCurrentStateData = $this->getMachineWithCurrentState($machine)->toArray();

            $machineCurrentStateData['operationDetails'] =
                $machineCurrentStateData['status_board_card_type'] == StatusBoardCardType::VIEW_2()
                    ? $this->getMachineWithOrderDetails($machine)
                    : new \stdClass();

            if (isset($machineCurrentStateData['standard_value_key'])) {
                $machineCurrentStateData['standardValueKey'] = $machineCurrentStateData['standard_value_key'];
                unset($machineCurrentStateData['standard_value_key']);
            } else {
                $machineCurrentStateData['standardValueKey'] = null;
            }


            if (isset($machineCurrentStateData['section_activatables'])) {
                $machineCurrentStateData['sectionActivatables'] = $machineCurrentStateData['section_activatables'];
                unset($machineCurrentStateData['section_activatables']);
            }

            // Rename standard_value_key_activity_types to standardValueKeyActivityTypes
            if (isset($machineCurrentStateData['standardValueKey']['standard_value_key_activity_types'])) {
                $machineCurrentStateData['standardValueKey']['standardValueKeyActivityTypes'] = $machineCurrentStateData['standardValueKey']['standard_value_key_activity_types'];
                unset($machineCurrentStateData['standardValueKey']['standard_value_key_activity_types']);
            }
            if (count($machineCurrentStateData['sectionActivatables'])) {
                $found = false;
                foreach ($machineCurrentStateData['sectionActivatables'] as $sectionActivatable) {
                    if ($sectionActivatable['section'] == SectionActivatableTypes::STATUSBOARD() && $sectionActivatable['is_active']) {
                        $found = true;
                        break;
                    }
                }
                if ($found) {
                    $allowedMachines->push($machineCurrentStateData);
                }
            }
        }

        $allowedMachines = collect($allowedMachines)->sortBy(function ($machine) {
            return $machine['sort_order'] ?? PHP_INT_MAX;
        })->values();

        return $allowedMachines;
    }

    function getMachineWithOrderDetails($machine)
    {
        $operationIds = $machine->prodOrderPosOperationTimes()
            ->where(function ($query) {
                $query->where('status', '=', ProdOrderPosOperationStatus::IN_PRODUCTION())
                    ->orWhere('status', '=', ProdOrderPosOperationStatus::IN_SETUP())
                    ->orWhere('status', '=', ProdOrderPosOperationStatus::IN_TEARDOWN());
            })
            ->whereNull('end')
            ->pluck('prod_order_pos_operation_id')
            ->toArray();

        if (empty($operationIds)) {
            return new \stdClass(); // Return an empty object if no operation IDs are found
        }

        $allDetails = $this->prodOrderPosOperationController->getOperationDetails(new Request([
            'prodOrderPosOperationIds' => $operationIds
        ]));
        $allDetails = $allDetails->getData();

        if (empty($allDetails)) {
            return new \stdClass(); // Return an empty object if no details are found
        }

        // Determine whether a linked order exists or use the first operation as default
        $linkedOrder = collect($allDetails)->first(fn($operation) => $operation?->isLinkedOrder ?? false);

        $orderDetail = null;

        if ($linkedOrder && collect($allDetails)->count() > 1) {
            $orderDetail = $linkedOrder;
        } elseif (collect($allDetails)->count() == 1) {
            $orderDetail = collect($allDetails)->first();
        }

        if ($orderDetail) {
            // Extract details safely
            return (object)[
                "orderQuantity" => optional($orderDetail)->orderQuantity ?? '',
                "residualQuantity" => optional($orderDetail)->residualQuantity ?? '',
                "goodItemsCount" => optional($orderDetail)->goodItemsCount ?? '',
                "badItemsCount" => optional($orderDetail)->badItemsCount ?? '',
                "reworkItemsCount" => optional($orderDetail)->reworkItemsCount ?? '',
                "standardCycle" => optional($orderDetail)->standardCycle ?? '',
                "currentCycle" => optional($orderDetail)->currentCycle ?? '',
                "unitOfMeasureCustomId" => optional($orderDetail)->unitOfMeasureCustomId ?? ''
            ];
        }

        // Return an empty object if no details are found
        return new \stdClass();
    }

    function getMachineCurrentState(Machine $machine, $requestFrom = "statusBoard")
    {
        return $this->getMachineWithCurrentState($machine, $requestFrom);
    }

    private function getMachineWithCurrentState($machine, $requestFrom = "statusBoard")
    {
        $currentOperation = $machine->prodOrderPosOperationTimes()
            ->with(['prodOrderPosOperation.prodOrderPos.item', 'prodOrderPosOperation.prodOrderPos.prodOrder'])
            ->where(function ($query) {
                $query->where('status', '=', ProdOrderPosOperationStatus::IN_PRODUCTION())
                    ->orWhere('status', '=', ProdOrderPosOperationStatus::IN_SETUP());
            })
            ->whereNull('end')
            ->first();

        $totalOperations = $machine->prodOrderPosOperationTimes()
            ->where(function ($query) {
                $query->where('status', '=', ProdOrderPosOperationStatus::IN_PRODUCTION())
                    ->orWhere('status', '=', ProdOrderPosOperationStatus::IN_SETUP());
            })
            ->whereNull('end')
            ->count();

        $currentStateTime = $machine->machineMachineStateTimes()->with('machineState.machineStateGroup')->where('end', '=', null)->first();
        if ($machine->machine_board_state_type == MachineBoardStateType::OPERATION_STATE->value) {
            # Need to show the machineboard machine status as per first operation of this specific machine.
            $machineProdOrderPosOperationTimes = MachineProdOrderPosOperationTime::query()
                ->where("machine_id", $machine->id)
                ->where("end", null)
                ->whereIn("status", [ProdOrderPosOperationStatus::IN_PRODUCTION(), ProdOrderPosOperationStatus::IN_SETUP(), ProdOrderPosOperationStatus::IN_TEARDOWN()])
                ->get();

            $ids = [];
            $machineProdOrderPosOperationTimes->filter(function ($query) use (&$ids) {
                array_push($ids, $query->prod_order_pos_operation_id);
            });

            # Set Card Status according to the first operation.
            $firstOperation = $this->getProdOrderPosOperations(request()->merge([
                'prodOrderPosOperationIds' => $ids,
            ]))->first();

            if (isset($firstOperation)) {
                $firstOperationOfProdOrderPosOperationTimes = $firstOperation->prodOrderPosOperationTimes->where('end', null)->first();

                if (isset($firstOperationOfProdOrderPosOperationTimes)) {
                    if ($firstOperationOfProdOrderPosOperationTimes->status == ProdOrderPosOperationStatus::IN_SETUP()->value) {
                        $machine['status'] = ProdOrderPosOperationStatus::IN_SETUP();
                    } elseif ($firstOperationOfProdOrderPosOperationTimes->status == ProdOrderPosOperationStatus::IN_PRODUCTION()->value) {
                        $machine['status'] = ProdOrderPosOperationStatus::IN_PRODUCTION();
                    } elseif ($firstOperationOfProdOrderPosOperationTimes->status == ProdOrderPosOperationStatus::IN_TEARDOWN()->value) {
                        $machine['status'] = ProdOrderPosOperationStatus::IN_TEARDOWN();
                    } else {
                        $machine['status'] = MachineStateStateType::OFF();
                    }
                } else {
                    $machine['status'] = MachineStateStateType::OFF();
                }
            } else {
                $machine['status'] = MachineStateStateType::OFF();
            }
        } else {
            if ($currentStateTime?->machineState?->state_type == MachineStateStateType::OFF()) {
                $machine['status'] = MachineStateStateType::OFF();
            } else if ($currentStateTime?->machineState?->state_type == MachineStateStateType::SETUP()) {
                $machine['status'] = MachineStateStateType::SETUP();
            } else if ($currentStateTime?->machineState?->state_type == MachineStateStateType::PRODUCTION()) {
                $machine['status'] = MachineStateStateType::PRODUCTION();
            } else if ($currentStateTime?->machineState?->state_type == MachineStateStateType::READY()) {
                $machine['status'] = MachineStateStateType::READY();
            } else {
                $machine['status'] = MachineStateStateType::STANDSTILL();
            }
        }

        $machine['current_operation_times'] = $currentOperation;
        $machine['machine_machine_state_time'] = $currentStateTime;
        $machine['total_operations'] = $totalOperations;

        return $machine;
    }

    function getCurrentMachineStates(Request $request, Machine $machine)
    {
        $machine_board_hours = $machine->machine_board_hours;
        $endDate = $this->getReducedTime($machine_board_hours);
        return MachineMachineStateTime::with('machineState.machineStateGroup')->where([['machine_id', '=', $machine->id], ['end', '>=', $endDate]])->orWhere([['machine_id', '=', $machine->id], ['end', '=', null]])->get();
    }

    private function getReducedTime($hours)
    {
        return Carbon::now()->subHour($hours);
    }

    /**
     * Add data to machine_machine_state_time pivot table
     * @param Request $request
     */
    function syncMachineMachineStateTime(Request $request, Machine $machine)
    {
        try {
            $lastMachineStateTimes = MachineMachineStateTime::where('machine_id', '=', $machine->id)->where('end', '=', null)->get();
            foreach ($lastMachineStateTimes as $lastMachineStateTime) {
                if ($lastMachineStateTime) {
                    $lastMachineStateTime->update([
                        'end' => now()
                    ]);
                }
            }
            $machineStateTime = MachineMachineStateTime::create([
                'machine_id' => $machine->id,
                'machine_state_id' => $request->machine_state_id ?? null,
                'start' => now(),
            ]);

            event(new MachineStateChanged($machine, $machineStateTime));

            $result = $machineStateTime;
        } catch (Exception $e) {
            $result = false;
        }
        return $result;
    }

    /**
     * Get the last state of given machine
     */
    function getLastMachineStateTime($machineId)
    {
        try {
            $lastMachineStateTime = MachineMachineStateTime::where('machine_id', '=', $machineId)->latest()->first();
            if (isset($lastMachineStateTime->end)) {
                $result = null;
            } else {
                $result = $lastMachineStateTime;
            }
        } catch (Exception $e) {
            $result = false;
        }
        return $result;
    }

    function getCurrentStates(Machine $machine)
    {
        $machine_board_hours = $machine->machine_board_hours;
        $endDate = $this->getReducedTime($machine_board_hours);
        $machineStates = $machine->machineState()->with([
            'machineMachineStateTimes' => function ($times) use ($machine, $endDate) {
                $times->where([['machine_id', '=', $machine->id], ['end', '>=', $endDate]])->orWhere([['machine_id', '=', $machine->id], ['end', '=', null]]);
            }
        ])->get();
        foreach ($machineStates as $key => $machineState) {
            $totalTime = 0;
            foreach ($machineState->machineMachineStateTimes as $time) {
                $start = new Carbon($time->start);
                $end = $time->end ? new Carbon($time->end) : new Carbon();
                $totalTime += $start->diffInSeconds($end);
            }
            $machineState['total_time'] = $totalTime;
        }
        $machineStates = $machineStates->toArray();
        usort($machineStates, function ($a, $b) {
            return $b['total_time'] - $a['total_time'];
        });
        $machineStates = array_filter($machineStates, function ($a) {
            return $a['total_time'] != 0;
        });
        $machineStates = array_slice($machineStates, 0, 6);
        $clonnedArray = [];
        foreach ($machineStates as $machineState) {
            array_push($clonnedArray, ['id' => $machineState['id'], 'name' => $machineState['name'], 'state_type' => $machineState['state_type'], 'color' => $machineState['color']]);
        }
        return $clonnedArray;
    }

    function getQualificationForChangingState(Machine $machine)
    {
        ['hasQualifiedUsers' => $hasQualifiedUsers, 'indispensableUsers' => $indispensableUsers, 'missingQualifications' => $missingQualifications] = $machine->checkQualifiedClockinUsers();
        return collect($indispensableUsers)->keys()->intersect(auth()->user()->id)->count() > 1;
    }

    function filterMachineStateTimesByDate(Machine $machine, $start, $end)
    {
        try {
            $dateFormat = 'Y-m-d H:i:s';
            $parsedStartDate = Carbon::createFromFormat('m-d, Y', $start);
            $parsedEndDate = Carbon::createFromFormat('m-d, Y', $end);
            $parsedStartDate->setTime(00, 00, 00);
            $parsedEndDate->setTime(23, 59, 59);
            $start_date = $parsedStartDate->format($dateFormat);
            $end_date = $parsedEndDate->format($dateFormat);
            $res = MachineMachineStateTime::with('machineState')->where('machine_id', $machine->id)->whereBetween('start', [$start_date, $end_date])->orderBy('start', 'DESC')->get();
        } catch (Exception $e) {
            $res = $e->getMessage();
        }
        return response()->json($res);
    }

    function itemStatesMachines(Request $request): JsonResponse
    {
        try {
            $itemStateIds = $request->itemStateIds;
            $machine = Machine::find($request->id);
            $machine->itemStates()->sync($itemStateIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    function machineMachineStates(Request $request): JsonResponse
    {
        try {
            $statesIds = $request->statesIds;
            $machine = Machine::find($request->id);
            $machine->machineState()->sync($statesIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    function checkQualifiedClockinUsers(Machine $machine, Request $request)
    {
        $operations = $request->operations ?? null;

        return $machine->checkQualifiedClockinUsers($operations);
    }

    function handleSectionActivatable(Request $request)
    {
        try {
            $validate = Validator::make($request->all(), [
                'activatable_type' => 'required',
                'activatable_id' => 'required',
                'section' => 'required',
                'is_active' => 'required'
            ]);

            if ($validate->fails()) {
                return response()->json([
                    'status' => 'failed',
                    'message' => 'Validation Error!',
                    'data' => $validate->errors(),
                ], 403);
            }
            $sectionActivatable = SectionActivatable::where('activatable_type', $request->activatable_type)->where('activatable_id', $request->activatable_id)->where('section', $request->section)->first();
            if (is_null($sectionActivatable)) {
                SectionActivatable::create([
                    'activatable_type' => $request->activatable_type,
                    'activatable_id' => $request->activatable_id,
                    'section' => $request->section,
                    'is_active' => $request->is_active,
                ]);
                $success = true;
            } else {
                $sectionActivatable->update(['is_active' => $request->is_active]);
                $success = true;
            }
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    /**
     * add data to machine_component_serial_number_profiles pivot table
     * @param Request $request
     */
    public function syncMachineComponentSerialNumberProfile(Request $request): JsonResponse
    {
        try {
            $serialProfileIds = $request->serialProfileIds;
            $machine = Machine::find($request->id);

            // It handles creating/deleting both operations
            $machine->machineComponentSerialNumberProfilesPivot()->sync($serialProfileIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    /**
     * add data to machine_last_serial_number_profiles pivot table
     * @param Request $request
     */
    public function syncMachineLastSerialNumberProfile(Request $request): JsonResponse
    {
        try {
            $serialProfileIds = $request->serialProfileIds;
            $machine = Machine::find($request->id);

            // It handles creating/deleting both operations
            $machine->machineLastSerialNumberProfilesPivot()->sync($serialProfileIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    /**
     * add data to machine_middle_serial_number_profiles pivot table
     * @param Request $request
     */
    public function syncMachineMiddleSerialNumberProfile(Request $request): JsonResponse
    {
        try {
            $serialProfileIds = $request->serialProfileIds;
            $machine = Machine::find($request->id);

            // It handles creating/deleting both operations
            $machine->machineMiddleSerialNumberProfilesPivot()->sync($serialProfileIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    public function getMachineByPlannedItem($items)
    {
        $items = json_decode($items);

        $response = ProdOrderPosOperation::select("id", "prod_order_pos_id", "machine_id", "start", "end")->with([
            "prodOrderPos" => function ($prodOrderPos) {
                $prodOrderPos->select("id", "item_id");
            },
            "machine" => function ($machine) {
                $machine->select("id", "name", "custom_id", "hall_id", "machine_group_id");
            },
            "machine.machineGroup" => function ($machineGroup) {
                $machineGroup->select("id", "name");
            },
            "machine.sectionActivatables" => function ($sectionActivatables) {
                $sectionActivatables->where('section', '=', SectionActivatableTypes::PLANVISU());
            },
        ])->where(function ($query) {
            $query
                ->orWhereNotNull('end')
                ->orWhereNotNull('start')
                ->orWhereNotNull('machine_id');
        })
            ->where('show_in_planvisu', true)
            ->where('status', '!=', ProdOrderPosOperationStatus::CLOSED())
            ->where('status', '!=', ProdOrderPosOperationStatus::DELETED())
            ->whereHas("prodOrderPos", function ($prodOrderPos) use ($items) {
                $prodOrderPos->whereIn("item_id", $items);
            })
            ->whereRelation("machine", 'is_active', true)
            ->get()
            ->pluck("machine")->unique("id");

        if (is_array($response)) {
            // Handle when response is indexed by integers (array format)
            return [
                "value" => $response
            ];
        } else {
            // Handle when response is indexed by strings (object format)
            return [
                "value" => $response->values()
            ];
        }
    }

    public function getMachineByPlannedOrder($orders)
    {
        $orders = json_decode($orders);

        if ($orders) {
            $data = ProdOrderPosOperation::select("id", "prod_order_pos_id", "machine_id", "pos", "status")->with([
                "prodOrderPos" => function ($prodOrderPos) {
                    $prodOrderPos->select("id", "item_id", "prod_order_id");
                },
                "machine" => function ($machine) {
                    $machine->select("id", "name", "custom_id", "hall_id", "machine_group_id");
                },
                "machine.machineGroup" => function ($machineGroup) {
                    $machineGroup->select("id", "name");
                },
                "machine.sectionActivatables" => function ($sectionActivatables) {
                    $sectionActivatables->where('section', '=', SectionActivatableTypes::PLANVISU());
                }
            ])
                ->where("status", "<>", ProdOrderPosOperationStatus::CLOSED())
                ->where("status", "<>", ProdOrderPosOperationStatus::DELETED())
                ->whereHas("prodOrderPos.prodOrder", function ($prodOrderPos) use ($orders) {
                    $prodOrderPos->whereIn("id", $orders)->orWhereIn("custom_id", $orders);

                })->whereRelation("machine", 'is_active', true)->get()->sortBy(function ($item) {
                    // Split the 'pos' into main and sub parts
                    $parts = explode('_', $item['pos']);
                    $main = (int)$parts[0];
                    $sub = isset($parts[1]) ? (int)$parts[1] : 0;

                    // Return a sortable value (main and sub as a tuple)
                    return [$main, $sub];
                });


            $response = $data->pluck("machine")->unique("id");
        } else {
            $response = Machine::select("id", "name", "custom_id", "hall_id", "machine_group_id")->with([
                "machineGroup" => function ($machineGroup) {
                    $machineGroup->select("id", "name");
                },
                "sectionActivatables" => function ($sectionActivatables) {
                    $sectionActivatables->where('section', '=', SectionActivatableTypes::PLANVISU());
                }
            ])->where('is_active', true)->get();
        }

        if (is_array($response)) {
            // Handle when response is indexed by integers (array format)
            return [
                "value" => $response
            ];
        } else {
            // Handle when response is indexed by strings (object format)
            return [
                "value" => $response->values()
            ];
        }
    }
}

