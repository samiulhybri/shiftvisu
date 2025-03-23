<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MachineState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class MachineStateController extends Controller
{
    /**
     * add data to machine_machine_state pivot table
     * @param Request $request
     */
    public function machineMachineState(Request $request): JsonResponse
    {
        try {
            $machineIds = $request->machinesIds;
            $machineState = MachineState::find($request->id);

            // It handles creating/deleting both operations
            $machineState->machines()->sync($machineIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }
}
