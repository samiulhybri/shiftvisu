<?php

namespace App\Http\Controllers;

use App\Enums\MachineStateType;
use App\Models\Machine;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\MachineUserTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MachineClockInController extends Controller
{

    protected QualificationController $qualificationController;
    protected MachineMachineStateTimeController $machineMachineStateTimeController;

    public function __construct(
        QualificationController           $qualificationController,
        MachineMachineStateTimeController $machineMachineStateTimeController
    )
    {
        $this->qualificationController = $qualificationController;
        $this->machineMachineStateTimeController = $machineMachineStateTimeController;
    }

    function saveMachinesClockInClockOutTimeWithActivityType(Request $request)
    {
        $validate = Validator::make($request->all(), [
            'user_id' => 'required',
            'machines' => 'array',
            'machines.*.machine_id' => 'required|integer',
            'machines.*.activity_type_id' => 'nullable|integer',
            'shift_id' => 'nullable|integer'
        ]);
        //Will be added later
        
        // $validate->sometimes('shift_id', 'required', function ($input) {
        //     return !empty($input->machines);
        // });

        if ($validate->fails()) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Validation Error!',
                'data' => $validate->errors(),
            ], 403);
        }

        $userId = $request->user_id;
        $shiftId = $request->shift_id;

        $machines = isset($request['machines']) ? $request['machines'] : [];
        $clockOutMachines = [];
        $response = $this->setMachinesClockInTimeWithActivityType($userId, $shiftId, $machines);
        return response()->json($response, 201);
    }

    function setMachinesClockInTimeWithActivityType($userId, $shiftId, $machines)
    {
        $machinesClockIn = [];
        $excludedIds = [];
        foreach ($machines as $machine) {
            $machineId = $machine['machine_id'];
            $activityTypeId = $machine['activity_type_id']; // This could be integer or null

            $machineUserTime = MachineUserTime::where('machine_id', $machineId)
                ->where('user_id', $userId)
                ->where('shift_id', $shiftId)
                ->where(function ($query) use ($activityTypeId) {
                    if ($activityTypeId) {
                        $query->where('standard_value_key_activity_type_id', $activityTypeId);
                    } else {
                        $query->whereNull('standard_value_key_activity_type_id');
                    }
                })
                ->whereNull('end')
                ->first();

            if (!$machineUserTime) {
                $machineUserTime = MachineUserTime::create([
                    'machine_id' => $machineId,
                    'user_id' => $userId,
                    'shift_id' => $shiftId,
                    'standard_value_key_activity_type_id' => $activityTypeId,
                    'start' => now(),
                    'end' => null
                ]);

                $machineObj = Machine::find($machineId);

                if ($machineObj->machine_state_type == MachineStateType::MANUAL()) {
                    // Set the machine state to on.
                    $defaultProductionState = $machineObj->machine_state_id_default_production;
                    if ($defaultProductionState) {
                        $this->machineMachineStateTimeController->updateMachineState($defaultProductionState, $machineId);
                    }
                }
            }

            $excludedIds[] = $machineUserTime->id;
            $machinesClockIn[] = $machineUserTime->load('machine', 'shift', 'user');
        }

        $machinesToClockOut = MachineUserTime::where('user_id', $userId)
            ->whereNotIn('id', $excludedIds)
            ->whereNull('end')
            ->get();

        $machinesClockOut = [];
        $machinesClockOutError = [];

        $response = [];

        foreach ($machinesToClockOut as $machineToClockOut) {
            $machine = $machineToClockOut->machine;

            if (
                $machine->needs_operator_for_production == true &&
                $machine->machineUserTime()->whereNull('end')->count() == 1
            ) {
                array_push($machinesClockOutError, $machineToClockOut->machine);
            } else {
                $machineToClockOut->end = now();
                $machineToClockOut->save();
    
                // If the user was the last one to clock out, set the machine state to off.
    
                /** @var Machine $machine */
                // $machine = $machineToClockOut->machine;
    
                if (
                    $machine->machine_state_type == MachineStateType::MANUAL() &&
                    $machine->machineUserTime()->whereNull('end')->count() == 0
                ) {
                    $defaultOffState = $machine->machine_state_id_default_off;
                    if ($defaultOffState) {
                        $this->machineMachineStateTimeController->updateMachineState($defaultOffState, $machine->id);
                    }
                }
                array_push($machinesClockOut, $machineToClockOut->machine_id);
            }
        }

        $response['clocked_in_machines'] = $machinesClockIn;
        $response['clocked_out_machines'] = $machinesClockOut;
        $response['clocked_out_error_machines'] = $machinesClockOutError;

        return $response;
    }

    function getMachineProdOrderPosOperationTimesByMachineIds($machineIds)
    {
        $machineProdOrderOperationTimes = MachineProdOrderPosOperationTime::with('prodOrderPosOperation.prodOrderPos.item')
            ->where('end', '=', null)
            ->whereIn('machine_id', $machineIds)
            ->get();

        return $machineProdOrderOperationTimes;
    }
}
