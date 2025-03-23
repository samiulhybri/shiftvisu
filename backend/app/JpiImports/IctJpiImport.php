<?php

namespace App\JpiImports;

use App\Contracts\JpiImportStrategy;
use App\Enums\JpiJobStrategy;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Models\Machine;
use App\Models\Model\JpiResource;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosOperation;
use App\Models\Model\JpiJob;
use App\Models\Model\JpiTask;
use App\Models\Model\JpiResourceGroup;
use App\Models\ResourceGroup;
use App\Models\Tool;
use App\Models\ToolGroup;
use App\Models\User;
use App\Models\UserGroup;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use PDO;

class IctJpiImport implements JpiImportStrategy
{
    private function getProcessingData($orderId, $arbgang, $machine_custom_id)
    {
        $totalGoodQuantity = null;
        $processingMachineCustomId = null;
        $processingStartTime = null;
        $lastProgressionTime = null;

        if (env('V10_ENABLED', true)) {
            $response = Http::withoutVerifying()->get(env('APP_URL') . "/shopfloor/php/shopfloor_services.php?service=get_time_of_quantity_entry&machine_custom_id=" . $machine_custom_id . "&order=" . urlencode($orderId . "|" . $arbgang));

            $totalGoodQuantity = $response['quantity'] ?? 0;
            $processingMachineCustomId = $machine_custom_id;
            $processingStartTime = $response['first_insert'] ?? now();
            $lastProgressionTime = $response['last_insert'] ?? now();
        }

        return [
            "TotalGoodQuantity" => $totalGoodQuantity,
            "ProcessingMachineCustomId" => $processingMachineCustomId,
            "ProcessingStartTime" => $processingStartTime,
            "LastProgressionTime" => $lastProgressionTime,
        ];
    }

    private function getMachineActiveSecondsSince($machineId, $since): float
    {
        $activeSeconds = 0.0;

        if (env('V10_ENABLED', true)) {
            $dbConnection = new PDO("mysql:host=" . env('DB_HOST') . ";port=" . env('DB_PORT') . ";dbname=diecast;charset=utf8mb4", env('DB_USERNAME'), env('DB_PASSWORD'));
            $dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Note that NOW() in sql is used, not now() in php. The database uses a different timezone.
            $query = "select still_first_entry, COALESCE(still_server_end_entry, NOW()) as still_server_end_entry 
                        from t_maschinen_status
                        where (still_server_end_entry >= ? or still_server_end_entry is null)
                          and bde_nr = ? and still_grund = ?;
             ";
            $stmt = $dbConnection->prepare($query);
            $stmt->setFetchMode(PDO::FETCH_ASSOC);
            $stmt->execute([
                $since,
                $machineId,
                env('PRODUCTION_V10')
            ]);
            $result = $stmt->fetchAll();
            foreach ($result as $row) {
                $activeSeconds += (new Carbon($row['still_first_entry']))
                    ->max($since)
                    ->diffInSeconds(new Carbon($row['still_server_end_entry']));
            }
        }

        return $activeSeconds;
    }

    public function importJpiJobs(?string $singleCustomId = null)
    {
//        $prosesDb = new PDO("odbc:" . env('ADDITIONAL_ERP_2_HOST'), env('ADDITIONAL_ERP_2_USERNAME'), env('ADDITIONAL_ERP_2_PASSWORD'));
        $allResourceGroups = JpiResourceGroup::all();

        $machineResourceIds = collect();
        $machineIdResourceIds = collect();
        foreach (Machine::all() as $machine) {
            $machineResourceIds[$machine->custom_id] = $machine->jpiResources->first()->id ?? null;
            $machineIdResourceIds['' . $machine->id] = $machine->jpiResources->first()->id ?? null;
        }

//        $query = "SELECT TRIM(AUFTRAG) as prod_order_pos_operation_pos,
//            ASTART as operation_start,
//            ISTSTUECK as quantity,
//            STATUS as status
//            FROM AUFTRAGSTATUS_Schertec";
//
//        $stmt = $prosesDb->prepare($query);
//        $stmt->setFetchMode(\PDO::FETCH_ASSOC);
//        $stmt->execute();
//        $results = $stmt->fetchAll();
//
        $prosesProgress = collect();
//        foreach ($results as $row) {
//            $pos = str_replace('.', '_', $row['prod_order_pos_operation_pos']);
//            $prosesProgress[$pos] = [
//                'start' => new Carbon($row['operation_start']),
//                'quantity' => $row['quantity'],
//            ];
//        }


        ProdOrder::with(['prodOrderPos', 'prodOrderPos.prodOrderPosOperations', 'prodOrderPos.prodOrderPosOperations.resourceGroup', 'prodOrderPos.prodOrderPosOperations.resourceGroup.hall', 'prodOrderPos.prodOrderPosOperations.machine',])
            ->when($singleCustomId, function ($query) use ($singleCustomId) {
                return $query->where('custom_id', $singleCustomId);
            })
            ->chunk(env('DATA_CHUNK_SIZE'), function (Collection $prodOrders) use ($allResourceGroups, $machineResourceIds, $machineIdResourceIds, $prosesProgress) {
                $allJobs = JpiJob::with(['jpiTasks', 'jpiTasks.jpiResGroups', 'jpiTasks.predecessorJpiTasks'])
                    ->where('model_type', ProdOrderPos::class)
                    ->whereIn('model_id', $prodOrders->pluck('prodOrderPos.*.id')->flatten())
                    ->get();

                foreach ($prodOrders as $prodOrder) {
                    foreach ($prodOrder->prodOrderPos as $prodOrderPos) {
                        $job = $allJobs->where('model_type', ProdOrderPos::class)
                            ->where('model_id', $prodOrderPos->id)->first();

                        if (!$job)
                            $job = new JpiJob();

                        $job->model_type = ProdOrderPos::class;
                        $job->model_id = $prodOrderPos->id;
                        $job->name = $prodOrder->custom_id;
                        $start = Carbon::parse($prodOrderPos->prodOrderPosOperations()->whereNot('status', ProdOrderPosOperationStatus::DELETED())->orderBy('start', 'asc')->first()?->start) ?? null;
                        $hall = $prodOrderPos->prodOrderPosOperations->first()?->resourceGroup?->hall ?? null;
                        if ($start &&
                            $hall &&
                            (
                                ($hall->frozen_zone_before_days && $start->isBefore(now()->addDays($hall->frozen_zone_before_days))) ||
                                ($hall->frozen_zone_after_weeks && $start->isAfter(now()->addDays($hall->frozen_zone_after_weeks)))
                            )
                        ) {
                            $job->automatic = false;
                        } else {
                            $job->automatic = true;
                        }
                        $job->strategy = JpiJobStrategy::JIT;
                        $job->due_date = $prodOrderPos->due_date;
                        $job->order_status = 'Released';
                        $job->customer = $hall?->custom_id ?? '';
                        $job->quantity = 1;
                        $job->release_date = $prodOrderPos->release_date;
                        $job->custom_field_value_1 = $prodOrderPos->item->custom_id;
                        $job->custom_field_value_2 = $prodOrderPos->item->name;
                        $job->custom_field_value_3 = $prodOrderPos->item?->itemGroup?->name;
                        $job->custom_field_value_4 = $prodOrderPos->item->category;
                        $job->custom_field_value_5 = $prodOrderPos->raw_material;
                        $job->custom_field_value_6 = "{$prodOrderPos->prodOrderPosOperations->first()?->component_availability} - {$prodOrderPos->prodOrderPosOperations->first()?->has_labels_prepared}";
                        $job->custom_field_value_7 = $prodOrderPos->batch;
                        $job->custom_field_value_8 = $prodOrderPos->is_production_possible;
                        $job->is_deleted =
                            $prodOrderPos->status == ProdOrderPosStatus::CLOSED() ||
                            $prodOrderPos->status == ProdOrderPosStatus::DELETED() ||
                            $job->customer == 'BK-METALLFERTIGUNG' ||
                            $job->customer == 'BK-ISOLIERT' ||
                            $job->customer == 'DZ-VERBINDUNGSTECHNIK' ||
                            Carbon::create($prodOrderPos->due_date)->isAfter(now()->addWeeks(4))
                                ? 1 : 0;

                        if ($job->isDirty([
                            'model_type',
                            'model_id',
                            'name',
                            'due_date',
                            'order_status',
                            'customer',
                            'quantity',
                            'custom_field_value_1',
                            'custom_field_value_2',
                            'custom_field_value_3',
                            'custom_field_value_4',
                            'custom_field_value_5',
                            'custom_field_value_6',
                            'custom_field_value_7',
                            'custom_field_value_8',
                            'is_deleted',
                        ])) {
                            $job->is_exported = 0;
                            $job->save();
                        }

                        $jpiTasks = collect();

                        $predecessors = collect();

                        foreach ($prodOrderPos->prodOrderPosOperations->sortBy('pos') as $opPlanPos) {
                            /** @var ProdOrderPosOperation $opPlanPos */
                            $taskNo = $opPlanPos->pos;

                            $quantity = $prodOrderPos->quantity;
                            $sendAheadQuantity = $opPlanPos->send_ahead_quantity;
                            $totalDoneQuantity = 0;
                            $processingStart = null;
                            $processingResource1 = null;
                            $processingResource2 = null;

                            $task = $job->jpiTasks()->where('model_type', ProdOrderPosOperation::class)
                                ->where('model_id', $opPlanPos->id)->first();

                            if (!$task)
                                $task = new JpiTask();


//                            $prosesValues = $prosesProgress[$opPlanPos->pos] ?? null;
//
//                            if($prosesValues) {
//                                $opPlanPos->status = ProdOrderPosOperationStatus::IN_PRODUCTION();
//                            } else
                            if ($opPlanPos->status == ProdOrderPosOperationStatus::IN_PRODUCTION()) {
                                $result = $this->getProcessingData($prodOrder->custom_id, $opPlanPos->pos, $opPlanPos->machine?->custom_id);

                                if ($result['ProcessingMachineCustomId'])
                                    $jpiResourceId = $machineResourceIds[$result['ProcessingMachineCustomId']] ?? null;
                                else
                                    $jpiResourceId = null;

                                $totalDoneQuantity = $result['TotalGoodQuantity'] ?? 0;
                                $processingStart = $opPlanPos->operation_start_date_v10 ?? ($result['ProcessingStartTime'] ?? null);
                                $processingResource1 = $jpiResourceId ?? ($machineIdResourceIds['' . $opPlanPos->machine_id] ?? null);

                                if ($result['ProcessingMachineCustomId']) {
                                    $lastProgression = new Carbon($totalDoneQuantity > 0 ? $result['LastProgressionTime'] : $opPlanPos->operation_start_date_v10);
                                    if($totalDoneQuantity == 0)
                                        $lastProgression = $lastProgression->addHour();

                                    $productionSecondsSinceLastProgression = $this->getMachineActiveSecondsSince(
                                        $result['ProcessingMachineCustomId'] ?? $opPlanPos->machine?->custom_id,
                                        $lastProgression
                                    );
                                    $totalDoneQuantity += $opPlanPos->te ? floor($productionSecondsSinceLastProgression / $opPlanPos->te) : 0;
                                }

                                if (($task->assignedResource1->model_type ?? '') == User::class) {
                                    $processingResource2 = $task->assigned_resource1;
                                }
                                if (($task->assignedResource2->model_type ?? '') == User::class) {
                                    $processingResource2 = $task->assigned_resource2;
                                }

                                if (($task->assignedResource1->model_type ?? '') == Tool::class) {
                                    $processingResource2 = $task->assigned_resource1;
                                }
                                if (($task->assignedResource2->model_type ?? '') == Tool::class) {
                                    $processingResource2 = $task->assigned_resource2;
                                }

                            } else if ($opPlanPos->status == ProdOrderPosOperationStatus::SUSPENDED()) {
                                $result = $this->getProcessingData($prodOrder->custom_id, $opPlanPos->pos, $opPlanPos->machine?->custom_id);

                                $quantity = $prodOrderPos->quantity - ($result['TotalGoodQuantity'] ?? 0);
                            }

                            $jpi_factor = $opPlanPos->resourceGroup()->first()->jpi_factor ?? 1;

                            $task->model_type = ProdOrderPosOperation::class;
                            $task->model_id = $opPlanPos->id;
                            $task->task_no = $taskNo;
                            $task->name = $opPlanPos->name;
                            $task->quantity = round($quantity / $jpi_factor);
                            $task->send_ahead_quantity = round($sendAheadQuantity / $jpi_factor);
                            $task->production_time_per_unit = round($opPlanPos->te * $jpi_factor);
                            $task->setup_time = $opPlanPos->tr;
                            $task->teardown_time = $opPlanPos->teardown_time ?? 0;
                            $task->transfer_time = $opPlanPos->transfer_time ?? 0;
                            $task->custom_field_value_1 = $prodOrderPos->item->custom_id;
                            $task->custom_field_value_2 = $prodOrderPos->item->name;
                            $task->custom_field_value_3 = $prodOrderPos->item?->itemGroup?->name;
                            $task->custom_field_value_4 = $prodOrderPos->item->category;
                            $task->custom_field_value_5 = $prodOrderPos->raw_material;
                            $task->custom_field_value_6 = "{$opPlanPos->component_availability} - {$opPlanPos->has_labels_prepared}";
                            $task->custom_field_value_7 = substr($opPlanPos->note ?? '', 0, min(strlen($opPlanPos->note ?? ''), 254));
                            $task->custom_field_value_10 = "{$opPlanPos->has_components_prepared}";
                            $task->processing_start = $processingStart;
                            $task->processing_resource1 = $processingResource1;
                            $task->processing_resource2 = $processingResource2;
                            $task->total_done_quantity = round($totalDoneQuantity / $jpi_factor);
                            $task->is_deleted =
                                $opPlanPos->status == ProdOrderPosOperationStatus::CLOSED() ||
                                $opPlanPos->status == ProdOrderPosOperationStatus::DELETED()
                                    ? 1 : 0;

                            //TODO: If jobs due_date changed, set planned_start

                            if ($job->wasChanged(['due_date']) ||
                                $task->isDirty([
                                    'model_type',
                                    'model_id',
                                    'task_no',
                                    'name',
                                    'quantity',
                                    'send_ahead_quantity',
                                    'production_time_per_unit',
                                    'setup_time',
                                    'teardown_time',
                                    'transfer_time',
                                    'custom_field_value_1',
                                    'custom_field_value_2',
                                    'custom_field_value_3',
                                    'custom_field_value_4',
                                    'custom_field_value_5',
                                    'custom_field_value_6',
                                    'custom_field_value_7',
                                    'custom_field_value_10',
                                    'processing_start',
                                    'processing_resource1',
                                    'processing_resource2',
                                    'total_done_quantity',
                                    'is_deleted',
                                ])) {

                                $task->is_exported = 0;
                            }

                            $finalDueDayUpdate = Carbon::parse('+14 days')->endOfDay();
                            $dueDate = Carbon::parse($prodOrderPos->due_date);
                            $includedInDueDateCheck = ['BK-HYDRAULISCH', 'BK-ISOLIERT'];
                            if ($dueDate->lte($finalDueDayUpdate) || !in_array($prodOrderPos->machine?->hall?->custom_id, $includedInDueDateCheck)) {
                                //Custom Fields should be reverted
                                if (!$task->id) {
                                    $task->custom_field_value_8 = 'NEW_TASK';
                                } else if ($task->isDirty(['quantity'])) {
                                    $task->custom_field_value_8 = 'QUANTITY_CHANGE';
                                } else if ($job->wasChanged(['due_date'])) {
                                    $task->custom_field_value_8 = 'TIME_CHANGE';
                                } else if ($task->is_exported) {
                                    $task->custom_field_value_8 = null;
                                }
                            }
                            $task->save();

                            $taskResourceGroupConstraints = collect();

                            if ($opPlanPos->resource_group_id) {
                                $resourceGroup = $allResourceGroups->where('model_type', ResourceGroup::class)
                                    ->where('model_id', $opPlanPos->resource_group_id)->first();

                                if ($resourceGroup)
                                    $taskResourceGroupConstraints->put($resourceGroup->id, null);
                            }

                            if ($opPlanPos->tool?->toolGroups()?->first()?->hall?->custom_id == "DZ-VERBINDUNGSTECHNIK-WZ") {
                                $toolResourceGroup = $allResourceGroups->where('model_type', ToolGroup::class)
                                    ->where('model_id', $opPlanPos->tool->toolGroups->first()->id)->first();

                                if ($toolResourceGroup) {
                                    $taskResourceGroupConstraints->put(
                                        $toolResourceGroup->id,
                                        collect([
                                            JpiResource::query()
                                                ->where('model_type', Tool::class)
                                                ->where('model_id', $opPlanPos->tool->id)
                                                ->first()
                                        ])
                                    );
                                }
                            } else if ($opPlanPos->user_group_id) {
                                $userResourceGroup = $allResourceGroups->where('model_type', UserGroup::class)
                                    ->where('model_id', $opPlanPos->user_group_id)->first();

                                if ($userResourceGroup) {
                                    $qualifiedUserBuilder = $opPlanPos->qualifiedUsersBuilder();
                                    $userConstraints = collect();
                                    if ($qualifiedUserBuilder) {
                                        $userConstraints = $qualifiedUserBuilder
                                            ->join('user_user_groups', 'users.id', 'user_user_groups.user_id')
                                            ->where('user_user_groups.user_group_id', $opPlanPos->user_group_id)
                                            ->join('jpi_resources', 'jpi_resources.model_id', 'users.id')
                                            ->where('jpi_resources.model_type', User::class)
                                            ->select("jpi_resources.id")
                                            ->get();
                                    }

                                    if (!$userConstraints->count()) {
                                        $username = "%NOKOMPETENZ IW%";
                                        if (str_contains($prodOrderPos->prodOrderPosOperations->first()?->resourceGroup?->hall?->custom_id ?? '', 'HYDRAULISCH')) {
                                            $username = "%NOKOMPETENZ HW%";
                                        }
                                        $userConstraints = User::where('users.name', 'LIKE', $username)
                                            ->join('user_user_groups', 'users.id', 'user_user_groups.user_id')
                                            ->where('user_user_groups.user_group_id', $opPlanPos->user_group_id)
                                            ->join('jpi_resources', 'jpi_resources.model_id', 'users.id')
                                            ->where('jpi_resources.model_type', User::class)
                                            ->select("jpi_resources.id")
                                            ->get();
                                    }
                                    $taskResourceGroupConstraints->put($userResourceGroup->id, $userConstraints);
                                }
                            }

                            $task->jpiResGroups()->sync($taskResourceGroupConstraints->keys()->unique());
                            foreach ($taskResourceGroupConstraints as $jpiResourceGroupId => $resources) {
                                if ($resources && $resources->count()) {
                                    $changes = $task
                                        ->jpiResourceGroupConstraints()
                                        ->where('jpi_resource_group_id', $jpiResourceGroupId)
                                        ->first()
                                        ->resourceConstraints()
                                        ->sync($resources->pluck('id'));

                                    if (count($changes['attached']) || count($changes['detached']) || count($changes['updated'])) {
                                        $task->is_exported = 0;
                                        $task->save();
                                    }
                                }
                            }
                            $task->predecessorJpiTasks()->sync($predecessors->pluck('id'));

                            $predecessors = collect([$task]);
                            $jpiTasks->push($task);
                        }

                        $job->jpiTasks()->sync($jpiTasks->pluck('id'));
                    }
                }
            });

        return Command::SUCCESS;
    }
}