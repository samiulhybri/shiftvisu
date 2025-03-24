<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Item;
use App\Models\Machine;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use Illuminate\Console\Command;

class OperationPlanImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:operationplan';

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

        $operations = $ds->operations();

        $machines = collect();
        foreach (Machine::all() as $machine) {
            $machines[$machine->custom_id] = $machine->id;
        }

        foreach ($operations as $operationChunks) {
            foreach ($operationChunks as $operation) {
                $record = OperationPlan::where('custom_id', $operation['custom_operation_plan_id'])->first();
                if (!$record) {
                    $record = new OperationPlan();
                    $record->custom_id = $operation['custom_operation_plan_id'];
                }

                // This is needed for toolvisu
                $record->is_imported = true;
                $record->save();

                $record_pos = OperationPlanPos::where('operation_plan_id', $record->id)
                    ->where('pos', $operation['custom_pos'])
                    ->first();

                if (!$record_pos) {
                    $record_pos = new OperationPlanPos();
                    $record_pos->operation_plan_id = $record->id;
                    $record_pos->pos = $operation['custom_pos'];
                }

                $record_pos->name = $operation['name'];

                // This is needed for toolvisu
                $record_pos->is_imported = true;

                if (isset($operation['te'])) {
                    $record_pos->te = $operation['te'];
                }

                if (isset($operation['tr'])) {
                    $record_pos->tr = $operation['tr'];
                }

                if ($machines->has($operation['custom_machine_id'])) {
                    $record_pos->machine_id = $machines[$operation['custom_machine_id']];
                } else {
                    $record_pos->machine_id = null;
                }

                $record_pos->save();
            }
        }

        return 0;
    }
}
