<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\DataImport;
use App\Models\Item;
use App\Models\Machine;
use App\Models\MachineGroup;
use App\Models\Qualification;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class QualificationDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:qualifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Imports qualifications using dtos';

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
        $xmlIds = [];

        $machines = Machine::get(['custom_id', 'id'])
            ->mapWithKeys(function ($machine) {
                return [
                    $machine->custom_id => [
                        'id' => $machine->id,
                    ],
                ];
            })->collect();

        $items = Item::get(['custom_id', 'id'])
            ->mapWithKeys(function ($item) {
                return [
                    $item->custom_id => [
                        'id' => $item->id,
                    ],
                ];
            })->collect();

        while ($chunk = $ds->qualificationDtos($skip, $take)) {
            $skip += $take;

            foreach ($chunk as $qualification) {
                if (isset($qualification->xml_id) && !in_array($qualification->xml_id, $xmlIds)) {
                    $xmlIds[] = $qualification->xml_id;
                }

                if (isset($qualification->item_id_custom) && !$items->has($qualification->item_id_custom))
                    continue;

                if (isset($qualification->machine_id_custom) && !$machines->has($qualification->machine_id_custom))
                    continue;

                $itemId = $items[$qualification->item_id_custom]['id'] ?? null;
                $machineId = $machines[$qualification->machine_id_custom]['id'] ?? null;

                $record = Qualification::where('item_id', $itemId)
                    ->where('item_id', $itemId)
                    ->where('machine_id', $machineId)
                    ->where('operation_code', $qualification->operation_code)
                    ->first();

                if (!$record) {
//                    if (!(isset($qualification->is_active) && $qualification->is_active)) {
//                        continue;
//                    }

                    $record = new Qualification();
                }

//                $record->is_active = $qualification->is_active;
                $record->item_id = $itemId;
                $record->machine_id = $machineId;
                $record->operation_code = $qualification->operation_code;
                $record->min_qualification_hours = $qualification->min_qualification_hours;
                $record->min_qualification_operations = $qualification->min_qualification_operations;
                $record->is_imported_from_erp = true;
                $record->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return 0;
    }
}
