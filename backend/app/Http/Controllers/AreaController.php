<?php

namespace App\Http\Controllers;

use App\Models\Area;
use Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;

use Exception;

class AreaController extends Controller
{
    /**
     * add data to machine_machine_state pivot table
     * @param Request $request
     */
    public function syncOrAttachUsers(Request $request, Area $area): JsonResponse
    {
        try {
            $userIds = $request->user_ids;
            
            // It handles creating/updating both operations
            $area->users()->sync($userIds);
            $success = true;
        } catch (Exception $e) {
            $success = false;
        }
        return response()->json(['success' => $success]);
    }
}
