<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ItemState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class ItemStatesController extends Controller
{
    /**
     * add data to machine_machine_state pivot table
     * @param Request $request
     */
    public function itemStatesMachines(Request $request): JsonResponse
    {
        try {
            $machineIds = $request->machinesIds;
            $itemState = ItemState::find($request->id);

            // It handles creating/deleting both operations
            $itemState->machines()->sync($machineIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }
}
