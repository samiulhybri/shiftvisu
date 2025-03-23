<?php

namespace App\Http\Controllers;

use App\Console\Commands\JPI\JpiDownloadJobs;
use App\Console\Commands\JPI\JpiImportHallResourceCategories;
use App\Console\Commands\JPI\JpiImportProdOrderJobTasks;
use App\Console\Commands\JPI\JpiImportMachineResources;
use App\Console\Commands\JPI\JpiImportToolResources;
use App\Console\Commands\JPI\JpiImportUserResources;
use App\Console\Commands\JPI\JpiUpdateMes;
use App\Console\Commands\JPI\JpiUploadJobs;
use App\Console\Commands\JPI\JpiUploadProgressJobs;
use App\Console\Commands\JPI\JpiUploadProgressJobsPrepared;
use App\Console\Commands\JPI\JpiUploadResourceCategories;
use App\Console\Commands\JPI\JpiUploadResourceGroups;
use App\Console\Commands\JPI\JpiUploadResources;
use App\Enums\JpiJobStrategy;
use App\Jobs\PlanVisuImport;
use App\Models\Machine;
use App\Models\Model\JpiJob;
use App\Models\Model\JpiResource;
use App\Models\Model\JpiResourceCategory;
use App\Models\Model\JpiResourceGroup;
use App\Models\Model\JpiTask;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosOperation;
use App\Models\ResourceGroup;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class JpiController extends Controller
{
    public function uploadBaseData()
    {
        try {
            (new JpiImportHallResourceCategories())->handle();
            (new JpiImportMachineResources())->handle();
            (new JpiImportToolResources())->handle();
            (new JpiImportUserResources())->handle();
            (new JpiUploadResourceCategories())->handle();
            (new JpiUploadResourceGroups())->handle();
            (new JpiUploadResources())->handle();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function uploadOrderData()
    {
        try {
            (new JpiImportProdOrderJobTasks())->handle();
            (new JpiUploadJobs())->handle();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function uploadOrderProgress()
    {
        try {
            (new JpiImportProdOrderJobTasks())->handle();
            (new JpiUploadProgressJobs())->handle();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function uploadOrderPreparedProgress()
    {
        try {
            Artisan::call('import_dto:prodorder'); //currently not used by intercable
            Artisan::call('import:prodorder');
            (new JpiImportProdOrderJobTasks())->handle();
            (new JpiUploadProgressJobsPrepared())->handle();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function downloadPlanningData()
    {
        try {
            (new JpiDownloadJobs())->handle();
            (new JpiUpdateMes())->handle();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * craeteOrUpdate resource-category
     * in this case machine-groups
     * to just-plan-it platform
     */
    public function cloudUploadResourceCategories()
    {
        try {
            JpiResourceCategory::chunk(env('DATA_CHUNK_SIZE'), function (Collection $resourceCategories) {
                foreach ($resourceCategories as $resourceCategory) {
                    if ($resourceCategory->name != '') {
                        $resourceCat = [
                            "Name" => $resourceCategory->name,
                        ];
                        $url = env('JUST_PLAN_IT_HOST') . '/resourcecategories';
                        if ($resourceCategory->jpi_guid != null) {
                            $url .= '/' . $resourceCategory->jpi_guid;
                        }
                        $req = Http::withHeaders([
                            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
                        ])->timeout(5000)->retry(5, throw: false);

                        if ($resourceCategory->jpi_guid != null) {
                            if ($resourceCategory->is_deleted) {
                                $response = $req->delete($url);
                                if ($response->successful()) {
                                    JpiResourceCategory::where('id', $resourceCategory['id'])->update([
                                        'jpi_guid' => null,
                                    ]);
                                } else {
                                    Log::error($response->body());
                                }
                            } else {
                                $response = $req->patch($url, $resourceCat);
                                if (!$response->successful()) {
                                    Log::error($response->body());
                                }
                            }
                        } else if (!$resourceCategory->is_deleted) {
                            $response = $req->post($url, $resourceCat);
                            if ($response->successful()) {
                                $responseData = $response->json();
                                JpiResourceCategory::where('id', $resourceCategory['id'])->update([
                                    'jpi_guid' => $responseData['Guid'],
                                    'name' => $responseData['Name'],
                                ]);
                            } else {
                                Log::error($response->body());
                            }
                        }
                    }
                }
            });

        } catch (Exception $exception) {
            Log::error($exception);
        }
    }

    /**
     * craeteOrUpdate resource-groups
     * in this case machine-groups
     * to just-plan-it platform
     */
    public function cloudUploadResourceGroups()
    {
        try {
            JpiResourceGroup::chunk(env('DATA_CHUNK_SIZE'), function (Collection $resourceGroups) {
                foreach ($resourceGroups as $resourceGroup) {
                    if ($resourceGroup->name != '') {
                        $resourceGrp = [
                            "Name" => $resourceGroup->name,
                            "Resources" => []
                        ];

                        if ($resourceGroup->jpiResourceCategory && $resourceGroup->jpiResourceCategory->jpi_guid) {
                            $resourceGrp["ResourceCategory"] = $resourceGroup->jpiResourceCategory->jpi_guid;
                        }

                        $url = env('JUST_PLAN_IT_HOST') . '/resourcegroups';
                        if ($resourceGroup->jpi_guid != null) {
                            $url .= '/' . $resourceGroup->jpi_guid;
                        }
                        $req = Http::withHeaders([
                            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
                        ])->timeout(5000)->retry(5, throw: false);

                        if ($resourceGroup->jpi_guid != null) {
                            if ($resourceGroup->is_deleted) {
                                $response = $req->delete($url);
                                if ($response->successful()) {
                                    JpiResourceGroup::where('id', $resourceGroup['id'])->update([
                                        'jpi_guid' => null,
                                    ]);
                                } else {
                                    Log::error($response->body());
                                }
                            } else {
                                $response = $req->patch($url, $resourceGrp);
                                if (!$response->successful()) {
                                    Log::error($response->body());
                                }
                            }
                        } else if (!$resourceGroup->is_deleted) {
                            $response = $req->post($url, $resourceGrp);
                            if ($response->successful()) {
                                $responseData = $response->json();
                                JpiResourceGroup::where('id', $resourceGroup['id'])->update([
                                    'jpi_guid' => $responseData['Guid'],
                                ]);
                            } else {
                                Log::error($response->body());
                            }
                        }
                    }
                }
            });
        } catch (Exception|Throwable $exception) {
            Log::error($exception);
        }
    }

    /**
     * craeteOrUpdate resource
     * in this case machine
     * to just-plan-it platform
     */
    public function cloudUploadResources()
    {
        try {
            JpiResource::chunk(env('DATA_CHUNK_SIZE'), function (Collection $resources) {
                /** @var JpiResource $resource */
                foreach ($resources as $resource) {
                    if ($resource->name != '') {
                        $resourceGroups = $resource->jpiResourceGroup()->get();
                        $resGroupsData = $resourceGroups->map(function ($group) {
                            return $group->jpi_guid;
                        });
                        if ($resGroupsData) {
                            $res = [
                                "Name" => $resource->name,
                                "ResourceGroups" => $resGroupsData->toArray(),
                                "Finite" => $resource->finite,
                                "CalendarExceptions" => []
                            ];

                            $url = env('JUST_PLAN_IT_HOST') . '/resources';
                            if ($resource->jpi_guid != null) {
                                $url .= '/' . $resource->jpi_guid;
                            }
                            $req = Http::withHeaders([
                                'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
                            ])->timeout(5000)->retry(5, throw: false);

                            if (env("EXTERNAL_DS_TARGET") == "ict_test" || $resource->model_type == User::class || $resource->jpi_guid == null) {
                                if ($resource->workTimePerWeekdays->count()) {
                                    //TODO If not all days, fill still also empty worktime for off days
                                    $res["WorktimesPerWeekday"] = $resource
                                        ->workTimePerWeekdays
                                        ->map(function ($workTimePerWeekday) {
                                            return [
                                                "DayOfWeek" => $workTimePerWeekday->weekday,
                                                "WorkTime" => $workTimePerWeekday->work_time
                                            ];
                                        })->toArray();
                                } else if (env("JPI_IMPORT_STRATEGY") == "sct") {
                                    $res["WorktimesPerWeekday"] = [
                                        [
                                            "DayOfWeek" => "Monday",
                                            "WorkTime" => "10:00-13:00 14:00-19:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Tuesday",
                                            "WorkTime" => "10:00-13:00 14:00-19:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Wednesday",
                                            "WorkTime" => "10:00-13:00 14:00-19:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Thursday",
                                            "WorkTime" => "10:00-13:00 14:00-19:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Friday",
                                            "WorkTime" => ""
                                        ],
                                        [
                                            "DayOfWeek" => "Saturday",
                                            "WorkTime" => ""
                                        ],
                                        [
                                            "DayOfWeek" => "Sunday",
                                            "WorkTime" => "10:00-13:00 14:00-19:00"
                                        ]
                                    ];
                                } else {
                                    $res["WorktimesPerWeekday"] = [
                                        [
                                            "DayOfWeek" => "Monday",
                                            "WorkTime" => "07:30-16:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Tuesday",
                                            "WorkTime" => "07:30-16:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Wednesday",
                                            "WorkTime" => "07:30-16:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Thursday",
                                            "WorkTime" => "07:30-16:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Friday",
                                            "WorkTime" => "07:30-16:00"
                                        ],
                                        [
                                            "DayOfWeek" => "Saturday",
                                            "WorkTime" => ""
                                        ],
                                        [
                                            "DayOfWeek" => "Sunday",
                                            "WorkTime" => ""
                                        ]
                                    ];
                                }

                                $res['CalendarExceptions'] = $resource
                                    ->calendarExceptions
                                    ->map(function ($calendarException) {
                                        return [
                                            "Date" => $calendarException->date,
                                            "WorkTime" => $calendarException->work_time
                                        ];
                                    })->toArray();
                            }

                            if ($resource->jpi_guid != null) {
                                if ($resource->is_deleted) {
                                    $response = $req->delete($url);
                                    if ($response->successful()) {
                                        JpiResource::where('id', $resource['id'])->update([
                                            'jpi_guid' => null,
                                        ]);
                                    } else {
                                        Log::error($response->body());
                                    }
                                } else {
                                    $response = $req->patch($url, $res);
                                    if (!$response->successful()) {
                                        Log::error($response->body());
                                    }
                                }
                            } else if (!$resource->is_deleted) {
                                $res["Capacity"] = 1;//TODO: Check bug with just plan it $resource->capacity,

                                $response = $req->post($url, $res);
                                if ($response->successful()) {
                                    $responseData = $response->json();
                                    JpiResource::where('id', $resource['id'])->update([
                                        'jpi_guid' => $responseData['Guid'],
                                        'name' => $responseData['Name'],
                                        'disabled' => $responseData['Disabled']
                                    ]);
                                } else {
                                    Log::error($response->body());
                                }
                            }
                        }
                    }
                }
            });

        } catch (Exception|Throwable $exception) {
            Log::error($exception);
        }
    }


    /**
     * craeteOrUpdate jpi-job
     * in this case ProdOrder
     * to just-plan-it platform
     */
    public function cloudUploadJobsWithTasks(?array $prodOrderPosOnly = null, ?array $prodOrderPosOperationsOnly = null)
    {

        try {
            $jpiJobIdsSynced = collect();
            JpiJob::query()
                ->when($prodOrderPosOnly, function ($query, $prodOrderPosOnly) {
                    $query->whereIn('model_id', $prodOrderPosOnly);
                })
                ->chunk(env('DATA_CHUNK_SIZE'), function ($jpiJobs) use ($jpiJobIdsSynced) {
                    $this->syncJobs($jpiJobs);
                    $jpiJobIdsSynced->push(...$jpiJobs->pluck('id'));
                });

            JpiJob::whereIn('id', $jpiJobIdsSynced->toArray())->update([
                'is_exported' => true,
                'updated_at' => now(),
            ]);

            $jpiTaskIdsSynced = collect();
            JpiTask::with(['jpiJobs', 'jpiResGroups', 'jpiResGroups.jpiResources', 'predecessorJpiTasks', 'processingResource1', 'processingResource2', 'predecessorJpiTasks'])
                ->when($prodOrderPosOperationsOnly, function ($query, $prodOrderPosOperationsOnly) {
                    $query->whereIn('model_id', $prodOrderPosOperationsOnly);
                })
                //TODO: FOR NOW CHUNK SIZE REDUCED TO 50
                ->chunk(50, function ($jpiTasks) use ($jpiTaskIdsSynced) {
                    $this->syncTasks($jpiTasks);
                    $jpiTaskIdsSynced->push(...$jpiTasks->pluck('id'));
                });

            JpiTask::whereIn('id', $jpiTaskIdsSynced->toArray())->update([
                'is_exported' => true,
                'updated_at' => now(),
            ]);
        } catch (Exception $exception) {
            Log::error($exception);
        }
    }

    /**
     * craeteOrUpdate jpi-job
     * in this case ProdOrder
     * to just-plan-it platform
     */
    public function cloudUploadJobsWithTasksProgress()
    {
        try {
            $jpiJobIdsSynced = collect();
            JpiJob::query()
                ->where('is_exported', false)
                ->chunk(env('DATA_CHUNK_SIZE'), function ($jpiJobs) use ($jpiJobIdsSynced) {
                    $this->syncJobs($jpiJobs);
                    $jpiJobIdsSynced->push(...$jpiJobs->pluck('id'));
                });

            JpiJob::whereIn('id', $jpiJobIdsSynced->toArray())->update([
                'is_exported' => true,
                'updated_at' => now(),
            ]);

            $jpiTaskIdsSynced = collect();
            JpiTask::with(['jpiJobs', 'jpiResGroups', 'jpiResGroups.jpiResources', 'predecessorJpiTasks', 'processingResource1', 'processingResource2', 'predecessorJpiTasks'])
                ->where('is_exported', false)
                //TODO: FOR NOW CHUNK SIZE REDUCED TO 50
                ->chunk(50, function ($jpiTasks) use ($jpiTaskIdsSynced) {
                    $this->syncTasks($jpiTasks);
                    $jpiTaskIdsSynced->push(...$jpiTasks->pluck('id'));
                });

            JpiTask::whereIn('id', $jpiTaskIdsSynced->toArray())->update([
                'is_exported' => true,
                'updated_at' => now(),
            ]);

        } catch (Exception $exception) {
            Log::error($exception);
        }
    }

    /**
     * craeteOrUpdate jpi-job
     * in this case ProdOrder
     * to just-plan-it platform
     */
    public function cloudUploadJobsWithPreparedProgress()
    {
        try {
            $jpiJobIdsSynced = collect();
            JpiJob::query()
                ->where('is_exported', false)
                ->whereNot('custom_field_value_8', '0')
                ->chunk(env('DATA_CHUNK_SIZE'), function ($jpiJobs) use ($jpiJobIdsSynced) {
                    $this->syncJobs($jpiJobs);
                    $jpiJobIdsSynced->push(...$jpiJobs->pluck('id'));
                });

            JpiJob::whereIn('id', $jpiJobIdsSynced->toArray())->update([
                'is_exported' => true,
                'updated_at' => now(),
            ]);

        } catch (Exception $exception) {
            Log::error($exception);
        }
    }


    function syncTasks(Collection $jpiTasks): void
    {
        $tasksPost = collect();
        $tasksPatch = collect();
        $tasksDelete = collect();
        $taskIds = [];
        foreach ($jpiTasks as $jpiTask) {
            if ($jpiTask->is_deleted && $jpiTask->jpi_guid)
                $tasksDelete->push($jpiTask->jpi_guid);

            if (!$jpiTask->is_deleted && $jpiTask->jpiJobs()->first() && $jpiTask->jpiJobs()->first()->jpi_guid) {

                $processingResourceGroup1 = null;
                $processingResourceGroup2 = null;

                $resourceGroupConstraints = collect([]);

                //Reduce risk of duplicating records in JPI
                if (!$jpiTask->jpi_guid) {
                    $jpiTask->jpi_guid = JpiTask::find($jpiTask->id)->jpi_guid ?? null;
                }

                //Do only set resource group in case of post/first creation
                foreach ($jpiTask->jpiResourceGroupConstraints as $jpiResourceGroupConstraint) {
                    $jpiResourceGroup = $jpiResourceGroupConstraint->jpiResourceGroup;
                    if (env('JPI_IMPORT_STRATEGY') == "ict" &&
                        $jpiTask->jpi_guid &&
                        //Do not update constraints for those halls, only do it for qualimatrix relevant stuff if more than 2 weeks in the future
                        collect(["DZ-VERBINDUNGSTECHNIK", "DZ-VERBINDUNGSTECHNIK-WZ"])->contains($jpiResourceGroup->jpiResourceCategory->name)) {
                        continue;
                    }
                    $resourceGroupConstraints->push([
                        "ResourceGroup" => $jpiResourceGroup->jpi_guid,
                        "ResourceConstraints" => $jpiResourceGroupConstraint
                            ->resourceConstraints()
                            ->pluck('jpi_guid')
                            ->toArray()
                    ]);

                    if ($jpiTask->processingResource1 && $jpiResourceGroup->jpiResources->contains('id', $jpiTask->processingResource1->id)) {
                        $processingResourceGroup1 = $jpiResourceGroup->jpi_guid;
                    }
                    if ($jpiTask->processingResource2 && $jpiResourceGroup->jpiResources->contains('id', $jpiTask->processingResource2->id)) {
                        $processingResourceGroup2 = $jpiResourceGroup->jpi_guid;
                    }
                }


                $processingResources = collect();
                $processingResourceGroups = collect();

                if ($jpiTask->processingResource1) {
                    $processingResources->push($jpiTask->processingResource1->jpi_guid);
                    if ($processingResourceGroup1) {
                        $processingResourceGroups->push($processingResourceGroup1);
                    } else {
                        $processingResourceGroups->push($jpiTask->processingResource1->jpiResourceGroup->first()->jpi_guid);
                    }
                }

                if ($jpiTask->processingResource2) {
                    $processingResources->push($jpiTask->processingResource2->jpi_guid);
                    if ($processingResourceGroup2) {
                        $processingResourceGroups->push($processingResourceGroup2);
                    } else {
                        $processingResourceGroups->push($jpiTask->processingResource2->jpiResourceGroup->first()->jpi_guid);
                    }
                }

                $jpiTaskData = [
                    "JobGuid" => $jpiTask->jpiJobs()->first()->jpi_guid,
                    "TaskNo" => $jpiTask->task_no,
                    "Name" => $jpiTask->name,
                    "Quantity" => $jpiTask->quantity,

                    "SendAheadQuantity" => $jpiTask->send_ahead_quantity,
                    "PredecessorTaskNos" => $jpiTask->predecessorJpiTasks->pluck('task_no')->toArray(),
                    "ShopfloorTotalDoneQuantity" => $jpiTask->shopfloor_total_done_quantity,
                    "TotalDoneQuantity" => $jpiTask->total_done_quantity,
                    "CustomFieldValue1" => $jpiTask->custom_field_value_1,
                    "CustomFieldValue2" => $jpiTask->custom_field_value_2,
                    "CustomFieldValue3" => $jpiTask->custom_field_value_3,
                    "CustomFieldValue4" => $jpiTask->custom_field_value_4,
                    "CustomFieldValue5" => $jpiTask->custom_field_value_5,
                    "CustomFieldValue6" => $jpiTask->custom_field_value_6,
                    "CustomFieldValue7" => $jpiTask->custom_field_value_7,
                    "CustomFieldValue8" => $jpiTask->custom_field_value_8,
                    "CustomFieldValue9" => $jpiTask->custom_field_value_9,
                    "CustomFieldValue10" => $jpiTask->custom_field_value_10,
                ];

                //Do only set if changed (otherwise manually reset in just plan it)
                if ($jpiTask->custom_field_value_8)
                    $jpiTaskData["CustomFieldValue8"] = $jpiTask->custom_field_value_8;

                if ($jpiTask->processing_start) {
                    $jpiTaskData["ProcessingResources"] = $processingResources->toArray();
                    $jpiTaskData["ProcessingResourceGroups"] = $processingResourceGroups->toArray();
                    $jpiTaskData["ProcessingStart"] = (new Carbon($jpiTask->processing_start))->format('Y-m-d\TH:i:s.v\Z');
                } else {
                    $jpiTaskData["MarkedAsStatus"] = "Planned";
                }


                if ($jpiTask->jpi_guid) {
                    $jpiTaskData['Guid'] = $jpiTask->jpi_guid;
                    //TODO: Check if planned start should be set/updated

                    $shouldUpdateConstraints = false;

                    if (env('JPI_IMPORT_STRATEGY') == "sct" && $resourceGroupConstraints->count()) {
                        $shouldUpdateConstraints = true;
                    }

                    if (env('JPI_IMPORT_STRATEGY') == "ict" && $resourceGroupConstraints->count()) {
                        $planned_start = new Carbon($jpiTask->planned_start);
                        $diffInCalendarWeeks = $planned_start->weekOfMillennium - Carbon::now()->weekOfMillennium;
                        $shouldUpdateConstraints = $jpiTask->planned_start == null || $diffInCalendarWeeks > 2;
                    }

                    if ($shouldUpdateConstraints) {
                        $jpiTaskData["ResourceGroupConstraints"] = $resourceGroupConstraints;
                    }
                    if (env('JPI_IMPORT_STRATEGY') == "sct") {
                        $jpiTaskData["ProductionTimePerUnit"] = $jpiTask->production_time_per_unit;
                        $jpiTaskData["TeardownTime"] = $jpiTask->teardown_time;
                        $jpiTaskData["TransferTime"] = $jpiTask->transfer_time;
                        $jpiTaskData["SetupTime"] = $jpiTask->setup_time;
                    }
                    $tasksPatch->push($jpiTaskData);
                } else if ($resourceGroupConstraints->count()) {
                    //Set properties that should not be overridden in case of patch
                    if($this->tryLock($jpiTask->id, JpiTask::class)) {
                        $jpiTaskData["ResourceGroupConstraints"] = $resourceGroupConstraints;
                        $jpiTaskData["ProductionTimePerUnit"] = $jpiTask->production_time_per_unit;
                        $jpiTaskData["TeardownTime"] = $jpiTask->teardown_time;
                        $jpiTaskData["TransferTime"] = $jpiTask->transfer_time;
                        $jpiTaskData["SetupTime"] = $jpiTask->setup_time;
                        $tasksPost->push($jpiTaskData);
                        $taskIds[] = $jpiTask->id;
                    }
                }
            }
        }

        $this->deleteTasks($tasksDelete);
        $this->patchTasks($tasksPatch);
        $this->postTasks($tasksPost,$taskIds);
    }

    function postTasks(Collection $tasks,$taskIds): void
    {
        if (!$tasks->count())
            return;

        $tasks->groupBy('JobGuid')->each(function ($tasks, $jobGuid) use (&$taskIds){
            $url = env('JUST_PLAN_IT_HOST') . '/jobs/' . $jobGuid . '/task/batch';

            $response = Http::withHeaders([
                'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
            ])->timeout(5000)->retry(5, throw: false);

            //TODO: Make check if $task has still no guid to further prevent duplicates

            Log::info('Trying post Tasks');
            $response = $response->post($url, $tasks);

            if ($response->successful()) {
                Log::info('Successfully posted Tasks');
                foreach ($response->json() as $responseTask) {
                    JpiTask::where('task_no', $responseTask['TaskNo'])
                        ->join("jpi_job_tasks", "jpi_tasks.id", "=", "jpi_job_tasks.jpi_task_id")
                        ->join("jpi_jobs", "jpi_job_tasks.jpi_job_id", "=", "jpi_jobs.id")
                        ->where("jpi_jobs.jpi_guid", $jobGuid)
                        ->update([
                            'jpi_tasks.jpi_guid' => $responseTask['Guid'],
                            'jpi_tasks.is_exporting' => false
                        ]);
                }
            } else {
                Log::error($response->body());
                //TODO: Reset planned start of all patched tasks
                JpiTask::whereIn('id', $taskIds)->update(['is_exporting' => false]);
            }
        });
    }

    function patchTasks(Collection $tasks): void
    {
        if (!$tasks->count())
            return;

        $url = env('JUST_PLAN_IT_HOST') . '/jobs/tasks/batch';

        $response = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(30)->retry(5, throw: false);

        Log::info('Trying patch tasks');
        $response = $response->patch($url, $tasks);

        if (!$response->successful()) {
            Log::error($response->body());
        } else {
            //TODO: Reset planned start of all patched tasks
            Log::info('Successfully patched tasks');
        }
    }

    function deleteTasks(Collection $tasks): void
    {
        if (!$tasks->count())
            return;

        $url = env('JUST_PLAN_IT_HOST') . '/jobs/tasks/batch';

        $response = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(5000)->retry(5, throw: false);

        $response = $response->delete($url, $tasks->toArray());

        if ($response->successful()) {
            JpiTask::whereIn('jpi_guid', $tasks)->update([
                'jpi_guid' => null,
            ]);
        } else {
            Log::error($response->body());
        }
    }

    function syncJobs(Collection $jpiJobs): void
    {
        $jobsPost = collect();
        $jobsPatch = collect();
        $jobsDelete = collect();
        $jobIds = [];
        foreach ($jpiJobs as $jpiJob) {
            if ($jpiJob->is_deleted && $jpiJob->jpi_guid)
                $jobsDelete->push($jpiJob->jpi_guid);

            if (!$jpiJob->is_deleted) {
                $jpiJobData = collect([
                    "Name" => $jpiJob->name,
                    "DueDate" => (new Carbon($jpiJob->due_date))->format('Y-m-d\TH:i:s.v\Z'),
                    "OrderStatus" => $jpiJob->order_status,
                    "JobNote" => $jpiJob->job_note,
                    "Quantity" => $jpiJob->quantity,
                    "Customer" => $jpiJob->customer,
                    "CustomFieldValue1" => $jpiJob->custom_field_value_1,
                    "CustomFieldValue2" => $jpiJob->custom_field_value_2,
                    "CustomFieldValue3" => $jpiJob->custom_field_value_3,
                    "CustomFieldValue4" => $jpiJob->custom_field_value_4,
                    "CustomFieldValue5" => $jpiJob->custom_field_value_5,
                    "CustomFieldValue6" => $jpiJob->custom_field_value_6,
                    "CustomFieldValue7" => $jpiJob->custom_field_value_7,
                    "CustomFieldValue8" => $jpiJob->custom_field_value_8,
                    "CustomFieldValue9" => $jpiJob->custom_field_value_9,
                ]);

//Temporarily disabled because resetting Automatic to 1 (even if it was already) deletes Task Resource Constraints
//                if(str_contains($jpiJob->customer ?? '', 'HYDRAULISCH') || str_contains($jpiJob->customer ?? '', 'METALLFERTIGUNG')) {
//                    $jpiJobData['Automatic'] = $jpiJob->automatic;
//                }

                if ($jpiJob->jpi_guid) {
                    $jpiJobData['Guid'] = $jpiJob->jpi_guid;
                    $jobsPatch->push($jpiJobData);
                } else {

                    if ($this->tryLock($jpiJob->id, JpiJob::class)) {
                        if(str_contains($jpiJob->customer ?? '', 'DZ-VERBINDUNGSTECHNIK')) {
                            $jpiJobData['Automatic'] = 1;
                        } else {
                            $jpiJobData['Automatic'] = 0;
                        }

                       //Set properties that should not be overridden in case of patch
                        $jpiJobData['ReleaseDate'] = (new Carbon($jpiJob->release_date))->format('Y-m-d\TH:i:s.v\Z');
                        $jpiJobData['Strategy'] = JpiJobStrategy::from($jpiJob->strategy)->jpiEnum();
                        $jobsPost->push($jpiJobData);
                        $jobIds [] = $jpiJob->id;
                    }
                }
            }
        }

        $this->deleteJobs($jobsDelete);
        $this->patchJobs($jobsPatch);
        $this->postJobs($jobsPost, $jobIds);
    }
    private function tryLock($id, $model): bool
    {
        return $model::query()
                ->where('id', $id)
                ->where('is_exporting', false)
                ->update(['is_exporting' => true]);
    }
    function postJobs(Collection $jobs, $jobIds): void
    {
        if (!$jobs->count())
            return;

        $url = env('JUST_PLAN_IT_HOST') . '/jobs/batch';

        $request = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(30)->retry(5, throw: false);

        Log::info(json_encode($jobIds));
        $response = $request->post($url, $jobs);

        if ($response->successful()) {
            Log::info('Success post jobs');
            foreach ($response->json() as $responseJob) {
                JpiJob::where('name', $responseJob['Name'])->update([
                    'jpi_guid' => $responseJob['Guid'],
                    'is_exporting' => false
                ]);
            }
        } else {
            Log::error($response->body());
            JpiJob::whereIn('id',$jobIds)->update(['is_exporting' => false]);
        }
    }


    function patchJobs(Collection $jobs): void
    {
        if (!$jobs->count())
            return;

        $url = env('JUST_PLAN_IT_HOST') . '/jobs/batch';

        $response = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(30)->retry(5, throw: false);

        Log::info('Trying patch jobs');
        $response = $response->patch($url, $jobs);

        if (!$response->successful()) {
            Log::error($response->body());
        }
        else {
            Log::info('Success patch jobs');
        }
    }

    function deleteJobs(Collection $jobs): void
    {
        if (!$jobs->count())
            return;

        $url = env('JUST_PLAN_IT_HOST') . '/jobs/batch';

        $response = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(5000)->retry(5, throw: false);

        $response = $response->delete($url, $jobs->toArray());

        if ($response->successful()) {
            JpiJob::whereIn('jpi_guid', $jobs)->update([
                'jpi_guid' => null,
            ]);
        } else {
            Log::error($response->body());
        }
    }

    public function cloudDownloadJobsWithTasks()
    {
        $url = env('JUST_PLAN_IT_HOST') . '/jobs';

        $request = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(5000)->retry(5, throw: false);

        $jobs = $request->get($url)->json();

        $jpiResources = collect();
        foreach (JpiResource::all() as $jpiResource) {
            $jpiResources[$jpiResource->jpi_guid] = $jpiResource->id;
        }
        $jpiResourceGroups = collect();
        foreach (JpiResourceGroup::all() as $jpiResourceGroup) {
            $jpiResourceGroups[$jpiResourceGroup->jpi_guid] = $jpiResourceGroup->id;
        }

        $jobsToDelete = collect();
        $tasksToDelete = collect();

        $downloadedJobs = collect();
        $downloadedTasks = collect();

        foreach ($jobs as $job) {
            $jobToUpdate = JpiJob::where('name', $job['Name'])->first();

            if (!$jobToUpdate) {
                $jobToUpdate = JpiJob::where('jpi_guid', $job['Guid'])->first();
            }
            if (!$jobToUpdate) {
                Log::info("[jpi download] Job not found: " . $job['Name']);
                $jobsToDelete->push($job['Guid']);
                continue;
            }

            $downloadedJobs->push($jobToUpdate->id);

            $jobToUpdate->update([
                'jpi_guid' => $job['Guid'],
                'planned_start' => $job['PlannedStart'] ?? null,
                'planned_end' => $job['PlannedEnd'] ?? null,
            ]);

            foreach ($job["Tasks"] as $task) {
                $taskToUpdate = $jobToUpdate
                    ->jpiTasks()
                    ->where('task_no', $task['TaskNo'])
                    ->first();
                if (!$taskToUpdate) {
                    $taskToUpdate = JpiTask::where('jpi_guid', $task['Guid'])->first();
                }
                if (!$taskToUpdate) {
                    Log::info("[jpi download] Task not found: " . $task['TaskNo']);
                    $tasksToDelete->push($task['Guid']);
                    continue;
                }

                $downloadedTasks->push($taskToUpdate->id);

                $taskToUpdate->update([
                    'jpi_guid' => $task['Guid'],
                    'assigned_resource1' => isset($task['AssignedResources'][0]) ? $jpiResources[$task['AssignedResources'][0]['Guid']] : null,
                    'assigned_resource2' => isset($task['AssignedResources'][1]) ? $jpiResources[$task['AssignedResources'][1]['Guid']] : null,
                    'assigned_resource_group1' => isset($task['ResourceGroupConstraints'][0]['ResourceGroupConstraints']['Guid']) ? $jpiResourceGroups[$task['ResourceGroupConstraints'][0]['ResourceGroupConstraints']['Guid']] : null,
                    'assigned_resource_group2' => isset($task['ResourceGroupConstraints'][1]['ResourceGroupConstraints']['Guid']) ? $jpiResourceGroups[$task['ResourceGroupConstraints'][1]['ResourceGroupConstraints']['Guid']] : null,
                    'planned_start' => $task['PlannedStart'] ? Carbon::parse($task['PlannedStart'])->subHour() : null,
                    'planned_end' =>  $task['PlannedEnd'] ? Carbon::parse($task['PlannedEnd'])->subHour() : null,
                ]);
            }
        }
        $this->deleteTasks($tasksToDelete);
        $this->deleteJobs($jobsToDelete);
        JpiJob::query()
            ->whereNotIn('id', $downloadedJobs->toArray())
            ->whereNotNull("jpi_guid")
            ->update(["jpi_guid" => null, "is_exported" => 0]);
        JpiTask::query()
            ->whereNotIn('id', $downloadedTasks->toArray())
            ->whereNotNull("jpi_guid")
            ->update(["jpi_guid" => null, "is_exported" => 0]);
    }

    public function updateMes()
    {
        //Only update records that come from jpi
        $jobs = JpiJob::whereNotNull('jpi_guid')->where('model_type', ProdOrderPos::class)->get();

        foreach ($jobs as $job) {
            if ($job->model_type == ProdOrderPos::class) {
                $pos = ProdOrderPos::find($job->model_id);
                if(!$pos) {
                    Log::error("[jpi update mes] Job not found: " . $job['Name'] . " - " . $job->model_id);
                    continue;
                }

                $pos->start = $job->planned_start;
                $pos->end = $job->planned_end;
                $pos->save();
            }
        }

        $tasks = JpiTask::whereNotNull('jpi_guid')->where('model_type', ProdOrderPosOperation::class)->get();

        foreach ($tasks as $task) {
            if ($task->model_type == ProdOrderPosOperation::class) {
                $pos = ProdOrderPosOperation::find($task->model_id);

                if(!$pos) {
                    Log::error("[jpi update mes] Task not found: " . $task->model_id);
                    continue;
                }

                $pos->start = $task->planned_start;
                $pos->end = $task->planned_end;
                $pos->plan_start = $task->planned_start;
                $pos->plan_end = $task->planned_end;

                $machineAssigned = false;
                $userAssigned = false;
                $resourceGroupAssigned = false;

                if ($task->assignedResource1 && $task->assignedResource1->model_type == Machine::class) {
                    if ($task->assignedResource1->model_id != $pos->erp_machine_id) {
                        $pos->plan_machine_id = $task->assignedResource1->model_id;
                        $pos->machine_id = $task->assignedResource1->model_id;
                        $machineAssigned = true;
                    }
                } else if ($task->assignedResource1 && $task->assignedResource1->model_type == User::class) {
                    $pos->user_id = $task->assignedResource1->model_id;
                    $userAssigned = true;
                }

                if ($task->assignedResource2 && $task->assignedResource2->model_type == Machine::class) {
                    if ($task->assignedResource2->model_id != $pos->erp_machine_id) {
                        $pos->plan_machine_id = $task->assignedResource2->model_id;
                        $pos->machine_id = $task->assignedResource2->model_id;
                        $machineAssigned = true;
                    }
                } else if ($task->assignedResource2 && $task->assignedResource2->model_type == User::class) {
                    $pos->user_id = $task->assignedResource2->model_id;
                    $userAssigned = true;
                }

                if ($task->assignedResourceGroup1 && $task->assignedResourceGroup1->model_type == ResourceGroup::class) {
                    $pos->resource_group_id_plan = $task->assignedResourceGroup1->model_id;
                    $pos->resource_group_id = $task->assignedResourceGroup1->model_id;
                    $resourceGroupAssigned = true;
                }

                if ($task->assignedResourceGroup2 && $task->assignedResourceGroup2->model_type == ResourceGroup::class) {
                    $pos->resource_group_id_plan = $task->assignedResourceGroup2->model_id;
                    $pos->resource_group_id = $task->assignedResourceGroup2->model_id;
                    $resourceGroupAssigned = true;
                }

                if (!$resourceGroupAssigned) {
                    $pos->resource_group_id_plan = null;
                    $pos->resource_group_id = $pos->resource_group_id_erp;
                }

                if (!$machineAssigned) {
                    $pos->plan_machine_id = null;
                    $pos->machine_id = $pos->erp_machine_id;
                }

                if (!$userAssigned) {
                    $pos->user_id = null;
                }

                if ($pos->start != $pos->getOriginal()['start'] ||
                    $pos->end != $pos->getOriginal()['end'] ||
                    $pos->machine_id != $pos->getOriginal()['machine_id']
                ) {
                    Log::info("Pos marked as changed start: ", [$pos->id, $pos->start, $pos->getOriginal()['start']]);
                    Log::info("Pos marked as changed end: ", [$pos->id, $pos->end, $pos->getOriginal()['end']]);
                    Log::info("Pos marked as changed mach: ", [$pos->id, $pos->machine_id, $pos->getOriginal()['machine_id']]);
                    $pos->is_changed = true;
                }

                $pos->save();
            }
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new PlanVisuImport(['t_auftrag', 't_auftrag_teile']));
        }
    }

    public function updatePlanningStart(): void
    {
        $settings = [
            'PlanningStart' => Carbon::now()->timezone('Europe/Rome')->format('Y-m-d\TH:i:s.v\Z'),
        ];

        $url = env('JUST_PLAN_IT_HOST') . '/settings';

        $request = Http::withHeaders([
            'X-Api-Key' => env('JUST_PLAN_IT_API_KEY')
        ])->timeout(5000)->retry(5, throw: false);

        $response = $request->patch($url, $settings);

        if (!$response->successful()) {
            Log::error($response->body());
        }
    }
}
