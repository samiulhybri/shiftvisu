<?php

namespace App\Http\Controllers;

use App\Events\MachineStateChanged;
use App\Models\Machine;
use App\Models\MachineMachineStateTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class MachineMachineStateTimeController extends Controller {

    public function saveMachineStateFromGateway(Request $request) {
        $request->validate([
            'machine_id' => 'required|integer',
            'machine_state_id' => 'nullable|integer',
            'start' => 'nullable|date',
        ]);

        $machineId = $request->get('machine_id');

        $machineMachineStateTimeCurrent = MachineMachineStateTime::query()
            ->where('machine_id', $machineId)
            ->whereNull('end')
            ->first();

        $isNewState = false;
        $date = $request->get('start', now());

        $machineStateId = $request->get('machine_state_id', null);

        if ($machineMachineStateTimeCurrent) {
            if ($machineMachineStateTimeCurrent->machine_state_id != $machineStateId) {
                $isNewState = true;
                $machineMachineStateTimeCurrent->end = $date;
                $machineMachineStateTimeCurrent->save();
            }
        }
        else {
            $isNewState = true;
        }

        if ($isNewState) {
            $machineMachineStateTimeCurrent = new MachineMachineStateTime();
            $machineMachineStateTimeCurrent->machine_id = $machineId;
            $machineMachineStateTimeCurrent->start = $date;
            $machineMachineStateTimeCurrent->machine_state_id = $machineStateId;
            $machineMachineStateTimeCurrent->save();

            event(new MachineStateChanged(Machine::query()->findOrFail($machineId), $machineMachineStateTimeCurrent));
        }
    }

    /**
     * add data to machine_machine_state pivot table
     * @param Request $request
     */
    public function machineMachineStateTime(Request $request): JsonResponse {
        try {
            $LastMachineStateTime = MachineMachineStateTime::where('machine_id', '=', $request->machine_id)->latest()->first();
            if ($LastMachineStateTime) {
                $LastMachineStateTime->update([
                    'end' => now()
                ]);
            }
            $machineStateTime = MachineMachineStateTime::create([
                'machine_id' => $request->machine_id,
                'machine_state_id' => $request->machine_state_id,
                'start' => now(),
            ]);
            $success = $machineStateTime;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }

    public function saveMachineStateFromDevice(Request $request) {
        if (!$request->m || !$request->stat || !isset($request->stat) || !in_array($request->stat, array("PRODUCTION", "STANDSTILL", "SETUP", "OFF"))) {
            return response()->json(['success' => false], 406);
        }
        $machine_id = $request->m;
        $selectedClientState = $this->getClientStatus($request->stat);
        $LastMachineStateTime = MachineMachineStateTime::where('machine_id', '=', $machine_id)->latest()->first();
        $isRusten = $LastMachineStateTime->machine_state_id == env('SETUP_V10');
        $currentState = $LastMachineStateTime->machine_state_id;
        try {
            if ($currentState == env('OFF_V10')) {
                //When machine is offline nothing other than Production and STANDSTILL should change the status
                //if the machine is in rüsten it should insert that status when ever PRODUCTION or STANDSTILL is passed
                if ($isRusten && $selectedClientState != env('OFF_V10') && $selectedClientState != env('SETUP_V10')) {
                    return $this->updateMachineState(env('SETUP_V10'), $machine_id);
                } else if ($selectedClientState == env('PRODUCTION_V10') || $selectedClientState == env('STANDSTILL_V10')) {
                    return $this->updateMachineState($selectedClientState, $machine_id);
                }
            } else if ($currentState == env('SETUP_V10')) {
                //when machine is in ruesten from the statusside Machine Off can overwrite it 
                //if in ruesten info table no ruesten is found and PRODUCTION or STANDSTILL is send it changes status accordingly(so when ruesten done in webpage send andino a signal to resend its status)
                if ($selectedClientState == env('OFF_V10')) {
                    return $this->updateMachineState($selectedClientState, $machine_id);
                } else if (!$isRusten && ($selectedClientState == env('PRODUCTION_V10') || $selectedClientState == env('STANDSTILL_V10'))) {
                    return $this->updateMachineState($selectedClientState, $machine_id);
                }
            } else if ($selectedClientState == env('OFF_V10')) {
                //When OFF is send it has the highest prio to be inserted
                return $this->updateMachineState($selectedClientState, $machine_id);
            } else if ($isRusten) {
                //the other conditions where not met so checking if machine is currently in ruesten when yes inserted it.
                //it can't be Status OFF as that is handled/catched in if above
                return $this->updateMachineState(env('SETUP_V10'), $machine_id);
            } else if ($selectedClientState != $currentState) {
                //only insert data if provided Status is something diffrent then in database
                //This issue will happen here: if user changes STANDSTILL to another reason LIKE electrical issue sending STANDSTILL to this API would insert a new row with STANDSTILL
                return $this->updateMachineState($selectedClientState, $machine_id);
            }
        } catch (Exception $e) {
            return response()->json(['success' => false], 501);
        }
        return response()->json(['success' => false], 501);
    }

    public function updateMachineState(int $machine_state_id, int $machine_id) {
        try {
            $lastMachineStateTime = MachineMachineStateTime::where('machine_id', '=', $machine_id)->whereNull('end')->first();

            if ($lastMachineStateTime?->machine_state_id == $machine_state_id) {
                return response()->json(['success' => true], 201);
            }

            if ($lastMachineStateTime) {
                $lastMachineStateTime->update([
                    'end' => now()
                ]);
            }
            MachineMachineStateTime::create([
                'machine_id' => $machine_id,
                'machine_state_id' => $machine_state_id,
                'start' => now(),
            ]);
            return response()->json(['success' => true], 201);
        } catch (Exception $e) {
            return response()->json(['success' => false], 501);
        }
        return response()->json(['success' => false], 501);
    }

    private function getClientStatus($stateId) {
        switch ($stateId) {
            case 'PRODUCTION':
                return env('PRODUCTION_V10');
            case 'STANDSTILL':
                return env('STANDSTILL_V10');
            case 'SETUP':
                return env('SETUP_V10');
            case 'OFF':
                return env('OFF_V10');
            default:
                return env('OFF_V10');
        }
    }

    public function updateMachineStateId(Request $request, Machine $machine, MachineMachineStateTime $machineStateTime): JsonResponse {
        $machineSateId = $request->get('machine_state_id', null);

        $machineStateTime->update([
            'machine_state_id' => $machineSateId
        ]);

        event(new MachineStateChanged($machine, $machineStateTime));

        return response()->json($machineStateTime, 200);
    }
}
