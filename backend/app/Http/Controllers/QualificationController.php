<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\Qualification;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QualificationController extends Controller
{
    function getMachineProdOrderPosOperationTimesByMachineId($machineId)
    {
        $machineProdOrderOperationTime = MachineProdOrderPosOperationTime::with('prodOrderPosOperation.prodOrderPos.item')
            ->where('end', '=', null)
            ->where('machine_id', $machineId)
            ->first();

        return $machineProdOrderOperationTime;
    }

    function getQualifications($itemId, $machineId, $operationCode, $userId)
    {
        $qualifications = Qualification::where(function ($query) use ($itemId) {
            $query->where('item_id', $itemId)
                ->orWhereNull('item_id');
        })
            ->where(function ($query) use ($machineId) {
                $query->where('machine_id', $machineId)
                    ->orWhereNull('machine_id');
            })
            ->where(function ($query) use ($operationCode) {
                $query->where('operation_code', $operationCode)
                    ->orWhereNull('operation_code');
            })
            ->with([
                'qualificationUsers' => function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->select('qualification_id', 'user_id', 'is_suspended', 'is_prequalified', 'total_hours', 'total_operations');
                }
            ])
            ->get();

        return $qualifications;
    }

    function qualificationUsers(Request $request): JsonResponse
    {
        try {
            $userIds = $request->userIds;
            $qualification = Qualification::find($request->id);
            $syncData = [];
            foreach ($userIds as $userId) {
                $syncData[$userId] = ['total_operations' => 0];
            }
            $qualification->users()->sync($syncData);
            $success = true;
        } catch (Exception $e) {
            $success = $e;
        }
        return response()->json(['success' => $success]);
    }

    function getQualifiedClockinUsers(Machine $machine, Request $request)
    {
        try {
            ['hasQualifiedUsers' => $hasQualifiedUsers, 'indispensableUsers' => $indispensableUsers, 'missingQualifications' => $missingQualifications] = $machine->checkQualifiedClockinUsers();
            return response()->json(["success" => true, "qualified_clockin_user_ids" => collect($indispensableUsers)->keys()]);
        } catch(\Exception $e) {
            return response()->json(["success" => false, $e->getMessage()]);
        }
    }
}
