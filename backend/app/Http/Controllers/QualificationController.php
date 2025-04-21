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
            $clockedInUserByOperationAndQualification = [];

            $clockedInUsers = $machine
                ->machineUserTime()
                ->with([
                    'user' => function ($query) {
                        $query->select('id', 'custom_id', 'name');
                    },
                ])
                ->whereNull("end")
                ->get()
                ->pluck("user");

            $operations = $machine
                ->prodOrderPosOperationTimes()
                ->with("prodOrderPosOperation")
                ->whereNull("end")
                ->get()
                ->pluck("prodOrderPosOperation");

            if (count($operations) > 0) {
                foreach ($operations as $operation) {
                    $requiredQualifications = Qualification::query()
                        ->where(function ($query) use ($machine) {
                            $query->where('qualifications.machine_id', $machine->id)
                                ->orWhereNull('qualifications.machine_id');
                        })
                        ->where(function ($query) use ($operation) {
                            $query->where('qualifications.operation_code', $operation->operation_code)
                                ->orWhereNull('qualifications.operation_code');
                        })
                        ->where(function ($query) use ($operation) {
                            $query->where('qualifications.item_id', $operation->prodOrderPos->item_id)
                                ->orWhereNull('qualifications.item_id');
                        })->get();

                    if (count($requiredQualifications) > 0) {
                        $intersection = [];
                        $qualifiedUsersForItemAndMachine = [];

                        foreach ($requiredQualifications as $qualification) {
                            if ($qualification->min_qualification_hours || $qualification->min_qualification_operations) {
                                $qualifiedUsers = $qualification->qualifiedUsers()->with([
                                    'user' => function ($query) {
                                        $query->select('id', 'custom_id', 'name');
                                    },
                                ])->get()->pluck('user');

                                $qualifiedUsersForItemAndMachine[] = $clockedInUsers->intersect($qualifiedUsers)->values();
                            } else {
                                $qualifiedUsersForItemAndMachine[] = $clockedInUsers;
                            }
                        }

                        $commonUsers = collect($qualifiedUsersForItemAndMachine)->map(function ($group) {
                            return collect($group);
                        })->reduce(function ($carry, $group) {
                            return $carry ? $carry->intersect($group) : $group;
                        });

                        $commonUsersArray = $commonUsers->values()->toArray();

                        $clockedInUserByOperationAndQualification[] = [
                            "operation_id" => $operation->id,
                            "qualifiedUsers" => $commonUsersArray,
                        ];

                    } else {
                        $clockedInUserByOperationAndQualification[] = [
                            "operation_id" => $operation->id,
                            "qualifiedUsers" => $clockedInUsers,
                        ];
                    }
                }
            } else {
                $requiredQualifications = Qualification::query()
                    ->where(function ($query) use ($machine) {
                        $query->where('qualifications.machine_id', $machine->id);
                    })->get();

                if (count($requiredQualifications) > 0) {
                    $intersection = [];

                    foreach ($requiredQualifications as $qualification) {
                        if ($qualification->min_qualification_hours || $qualification->min_qualification_operations) {
                            $qualifiedUsers = $qualification->qualifiedUsers()->with([
                                'user' => function ($query) {
                                    $query->select('id', 'custom_id', 'name');
                                },
                            ])->get()->pluck('user');

                            $intersection = $clockedInUsers->intersect($qualifiedUsers)->values();
                        } else {
                            $intersection = $clockedInUsers;
                        }

                        $clockedInUserByOperationAndQualification[] = [
                            "operation_id" => null,
                            "qualifiedUsers" => $intersection,
                        ];
                    }
                } else {
                    $clockedInUserByOperationAndQualification[] = [
                        "operation_id" => null,
                        "qualifiedUsers" => $clockedInUsers,
                    ];
                }
            }

            $groupUsers = collect($clockedInUserByOperationAndQualification)
                ->groupBy('operation_id') // Group by operation_id
                ->map(function ($items) {
                    return [
                        "operation_id" => $items->first()['operation_id'],
                        "qualifiedUsers" => $items->pluck('qualifiedUsers')
                            ->flatten(1)
                            ->unique('id')
                            ->values()
                    ];
                })
                ->values();
            return response()->json(["clockedInUsers" => $clockedInUsers, "qualifiedByOperations" => $groupUsers]);
        } catch (\Exception $e) {
            return response()->json(["success" => false, $e->getMessage()]);
        }
    }
}
