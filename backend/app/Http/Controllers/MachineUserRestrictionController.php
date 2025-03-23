<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class MachineUserRestrictionController extends Controller
{
    /**
     * add data to user_machine_restriction pivot table
     * @param Request $request
     */
    public function machineUserRestriction(Request $request): JsonResponse
    {
        try {
            $machineIds = $request->machinesIds;
            $user = User::find($request->id);

            // It handles creating/deleting both operations
            $user->machines()->sync($machineIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }
}
