<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Machine;
use App\Models\MachineProdOrderPosOperationTime;
use App\Models\ProdOrderPosOperation;
use Illuminate\Console\Command;

class MachineProdOrderPosOperationTimeDtoImport extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:machine_prod_order_pos_operation_times';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $machines = [];
        foreach (Machine::all() as $machine) {
            $machines[$machine->custom_id] = $machine->id;
        }

        $operations = [];
        foreach (ProdOrderPosOperation::with(['prodOrderPos' => ['prodOrder', 'item']])->get() as $operation) {
            $customId = $operation['prodOrderPos']['prodOrder']['custom_id'];
            $item = $operation['prodOrderPos']['item']['custom_id'];
            $opPos = $operation['pos'];

            $operations[$customId][$item][$opPos] = $operation->id;
        }

        MachineProdOrderPosOperationTime::query()->delete();

        while (($chunk = $ds->machineProdOrderPosOperationTimeDtos($skip, $take)) !== false) {
            $skip += $take;
            $toInsert = [];
            foreach ($chunk as $machineTimeDto) {
                if (!isset($machines[$machineTimeDto->machine_id_custom])) {
                    continue;
                }
                $machineProdOrderPosOperationTime = new MachineProdOrderPosOperationTime();
                $machineProdOrderPosOperationTime->machine_id = $machines[$machineTimeDto->machine_id_custom];

                $operationId = $operations[$machineTimeDto->prod_order_id_custom][$machineTimeDto->prod_order_pos_item_id_custom][$machineTimeDto->prod_order_pos_operation_pos]
                    ?? null;

                if (!$operationId) {
                    continue;
                }

                $machineProdOrderPosOperationTime->prod_order_pos_operation_id = $operationId;
                $machineProdOrderPosOperationTime->status = $machineTimeDto->status;
                $machineProdOrderPosOperationTime->start = $machineTimeDto->start;
                $machineProdOrderPosOperationTime->end = $machineTimeDto->end;

                $toInsert[] = [
                    ...$machineProdOrderPosOperationTime->toArray(),
                    "created_at" => now(),
                    "updated_at" => now(),
                ];
            }
            MachineProdOrderPosOperationTime::query()->insert($toInsert);
        }
    }
}
