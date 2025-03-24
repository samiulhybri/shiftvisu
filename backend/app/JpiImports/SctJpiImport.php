<?php

namespace App\JpiImports;

use App\Contracts\JpiImportStrategy;
use App\Enums\ProdOrderPosOperationStatus;
use App\Enums\ProdOrderPosStatus;
use App\Models\Machine;
use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosOperation;
use App\Models\Model\JpiJob;
use App\Models\Model\JpiResource;
use App\Models\Model\JpiTask;
use App\Models\ResourceGroup;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Console\Command;

class SctJpiImport implements JpiImportStrategy
{
    private function getResourceIdForUnassigned(string $operationName): int
    {
        $unassignedMachine = Machine::where("custom_id", "UNASSIGNED")->first();
        $unassignedResource = JpiResource::where("model_type", Machine::class)
            ->where("model_id", $unassignedMachine->id)
            ->first();
        return $unassignedResource->id;
    }

    public function importJpiJobs(?string $singleCustomId = null)
    {
        $resourceGroupAssigned = ResourceGroup::where("custom_id", "SCT 80001")->first();
        $resourceGroupUnassigned = ResourceGroup::where("custom_id", "SCT 90001")->first();

        ProdOrder::with(['prodOrderPos', 'prodOrderPos.prodOrderPosOperations'])
            ->when($singleCustomId, function ($query) use ($singleCustomId) {
                $query->where('custom_id', $singleCustomId);
            })
            ->chunk(
                env('DATA_CHUNK_SIZE'),
                function (Collection $prodOrders) use ($resourceGroupAssigned, $resourceGroupUnassigned) {
                    $allJobs = JpiJob::with(['jpiTasks', 'jpiTasks.jpiResGroups', 'jpiTasks.predecessorJpiTasks'])
                        ->where('model_type', ProdOrderPos::class)
                        ->whereIn('model_id', $prodOrders->pluck('prodOrderPos.*.id')->flatten())
                        ->get();

                    /** @var ProdOrder $prodOrder */
                    foreach ($prodOrders as $prodOrder) {
                        foreach ($prodOrder->prodOrderPos as $prodOrderPos) {
                            $job = $allJobs->where('model_type', ProdOrderPos::class)
                                ->where('model_id', $prodOrderPos->id)->first();

                            if (!$job)
                                $job = new JpiJob();

                            $job->model_type = ProdOrderPos::class;
                            $job->model_id = $prodOrderPos->id;
                            $job->name = $prodOrderPos->item->name . ' (' . $prodOrder->custom_id . '.' . $prodOrderPos->pos . ')';
                            $job->due_date = $prodOrderPos->due_date;
                            $job->order_status = 'Released';
                            $job->quantity = 1;
                            $job->release_date = $prodOrderPos->release_date;
                            $job->customer = $prodOrderPos->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'client_name')
                                ->first()?->value_string;
                            $job->custom_field_value_1 = $prodOrder->custom_id;
                            $job->custom_field_value_2 = $prodOrder->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'Task_name')
                                ->first()?->value_string;
                            $job->custom_field_value_3 = $prodOrder->assembly;
                            $job->custom_field_value_4 = $prodOrder->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'MainTask')
                                ->first()?->value_string;
                            $job->custom_field_value_5 = $prodOrder->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'Module')
                                ->first()?->value_string;
                            $job->custom_field_value_6 = $prodOrder->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'Project')
                                ->first()?->value_string;
                            $job->custom_field_value_7 = $prodOrder->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'Task_Progress')
                                ->first()?->value_string;
                            $job->custom_field_value_8 = $prodOrder->classifications()
                                ->where('class', 'JPI_SCT')
                                ->where('attribute', 'Creator_Task')
                                ->first()?->value_string;
                            $job->custom_field_value_9 = $prodOrderPos->pos;
                            $job->is_deleted =
                                str_starts_with($job->name, "UI/UX") ||
                                $prodOrderPos->status == ProdOrderPosStatus::CLOSED() ||
                                $prodOrderPos->status == ProdOrderPosStatus::DELETED()
                                    ? 1 : 0;

                            if ($job->isDirty([
                                'model_type',
                                'model_id',
                                'name',
                                'due_date',
                                'order_status',
                                'quantity',
                                'release_date',
                                'customer',
                                'custom_field_value_1',
                                'custom_field_value_2',
                                'custom_field_value_3',
                                'custom_field_value_4',
                                'custom_field_value_5',
                                'custom_field_value_6',
                                'custom_field_value_7',
                                'custom_field_value_8',
                                'custom_field_value_9',
                                'is_deleted',
                            ])) {
                                $job->is_exported = 0;
                                $job->save();
                            }

                            $jpiTasks = collect();

                            $predecessors = collect();

                            foreach ($prodOrderPos->prodOrderPosOperations->sortBy('pos') as $opPlanPos) {
                                $taskNo = $opPlanPos->pos;

                                $quantity = $prodOrderPos->quantity;
                                $sendAheadQuantity = $opPlanPos->send_ahead_quantity;
                                $totalDoneQuantity = 0;
                                $processingStart = null;
                                $processingResource1 = null;
                                $processingResource2 = null;

                                $quantity = $quantity - $opPlanPos->registered_quantity;

                                $task = $job->jpiTasks()->where('model_type', ProdOrderPosOperation::class)
                                    ->where('model_id', $opPlanPos->id)->first();

                                if (!$task)
                                    $task = new JpiTask();

                                $task->model_type = ProdOrderPosOperation::class;
                                $task->model_id = $opPlanPos->id;
                                $task->task_no = $taskNo;
                                $task->name = $opPlanPos->name;
                                $task->quantity = $quantity;
                                $task->send_ahead_quantity = $sendAheadQuantity;
                                $time = round($opPlanPos->te);

                                $task->production_time_per_unit = $opPlanPos->tr ? 0 : $time;

                                $task->setup_time = $opPlanPos->tr;
                                $task->teardown_time = $opPlanPos->teardown_time ?? 0;
                                $task->transfer_time = $opPlanPos->transfer_time ?? 0;
                                $task->custom_field_value_1 = $opPlanPos->name;
                                $task->custom_field_value_2 = $prodOrder->custom_id;
                                $task->custom_field_value_3 = $prodOrder->assembly;
                                $task->custom_field_value_4 = $opPlanPos->registered_quantity;
                                $task->custom_field_value_5 = $prodOrderPos->pos;
                                $task->custom_field_value_6 = $prodOrderPos->classifications()
                                    ->where('class', 'JPI_SCT')
                                    ->where('attribute', $opPlanPos->name == "Design" ? 'understanding' : 'design_review')
                                    ->first()?->value_string;
                                $task->custom_field_value_7 = $prodOrderPos->item->name;
                                $task->custom_field_value_9 = $prodOrder->classifications()
                                    ->where('class', 'JPI_SCT')
                                    ->where('attribute', 'Module')
                                    ->first()?->value_string;
                                $task->custom_field_value_10 = $prodOrder->classifications()
                                    ->where('class', 'JPI_SCT')
                                    ->where('attribute', 'Project')
                                    ->first()?->value_string;
                                $task->processing_start = $processingStart;
                                $task->processing_resource1 = $processingResource1;
                                $task->processing_resource2 = $processingResource2;
                                $task->total_done_quantity = $totalDoneQuantity;
                                $task->is_deleted =
                                    $opPlanPos->status == ProdOrderPosOperationStatus::CLOSED() ||
                                    $opPlanPos->status == ProdOrderPosOperationStatus::DELETED()
                                        ? 1 : 0;

                                if (
                                    $job->wasChanged(['due_date']) ||
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
                                        'custom_field_value_9',
                                        'custom_field_value_10',
                                        'processing_start',
                                        'processing_resource1',
                                        'processing_resource2',
                                        'total_done_quantity',
                                        'is_deleted',
                                    ])
                                ) {

                                    if (!$task->id) {
                                        $task->custom_field_value_8 = 'NEW_TASK';
                                    } else if ($task->isDirty(['quantity'])) {
                                        $task->custom_field_value_8 = 'QUANTITY_CHANGE';
                                    } else if ($job->wasChanged(['due_date'])) {
                                        $task->custom_field_value_8 = 'TIME_CHANGE';
                                    } else if ($task->is_exported) {
                                        $task->custom_field_value_8 = null;
                                    }

                                    $task->is_exported = 0;
                                    $task->save();
                                }

                                $resourceId = JpiResource::where("model_type", Machine::class)
                                    ->where("model_id", $opPlanPos->erp_machine_id)
                                    ->whereNotNull("jpi_guid")
                                    ->first()
                                    ?->id;

                                if ($resourceId) {
                                    $resourceGroupId = $resourceGroupAssigned->id;
                                } else {
                                    $resourceGroupId = $resourceGroupUnassigned->id;
                                    $resourceId = $this->getResourceIdForUnassigned($opPlanPos->name);
                                }

                                $syncResult = $task->jpiResGroups()->sync([$resourceGroupId]);

                                if ($syncResult['attached'] || $syncResult['detached']) {
                                    $task->is_exported = 0;
                                    $task->save();
                                }

                                $syncResult = $task
                                    ->jpiResourceGroupConstraints()
                                    ->where('jpi_resource_group_id', $resourceGroupId)
                                    ->first()
                                    ->resourceConstraints()
                                    ->sync([$resourceId]);

                                if ($syncResult['attached'] || $syncResult['detached']) {
                                    $task->is_exported = 0;
                                    $task->save();
                                }

                                $task->predecessorJpiTasks()->sync($predecessors->pluck('id'));

                                $predecessors = collect([$task]);
                                $jpiTasks->push($task);
                            }

                            $job->jpiTasks()->sync($jpiTasks->pluck('id'));
                        }
                    }
                }
            );

        return Command::SUCCESS;
    }
}
