<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Machine;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use Illuminate\Console\Command;

class OperationPlanDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:operationplan';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $machines = collect();
        foreach (Machine::all() as $machine) {
            $machines[$machine->custom_id] = $machine->id;
        }

        while ($chunk = $ds->operationDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $operation) {
                $record = OperationPlan::where('custom_id', $operation->custom_id)->first();
                if (!$record) {
                    $record = new OperationPlan();
                    $record->custom_id = $operation->custom_id;
                }
                
                // This is needed for toolvisu
                $record->is_imported = true;
                $record->save();

                foreach ($operation->operation_plan_pos as $operation_pos) {
                    $record_pos = OperationPlanPos::where('operation_plan_id', $record->id)
                        ->where('pos', $operation_pos->pos)
                        ->first();

                    if (!$record_pos) {
                        $record_pos = new OperationPlanPos();
                        $record_pos->operation_plan_id = $record->id;
                        $record_pos->pos = $operation_pos->pos;
                    }
                    $record_pos->name = $operation_pos->name ?? $record_pos->name;
                    //Not sure why this is needed
                    $record_pos->is_imported = true;
                    $record_pos->lead_time_days = $operation_pos->lead_time_days ?? $record_pos->lead_time_days;
                    $record_pos->te = $operation_pos->te ?? $record_pos->te;
                    $record_pos->tr = $operation_pos->tr ?? $record_pos->tr;
                    $record->cavity = $operation_pos->cavity ?? $record_pos->cavity;

                    if ($machines->has($operation_pos->machine_id_custom)) {
                        $record_pos->machine_id = $machines[$operation_pos->machine_id_custom];
                    } else {
                        $record_pos->machine_id = null;
                    }

                    $record_pos->save();
                }
            }
        }

        return 0;
    }
}
