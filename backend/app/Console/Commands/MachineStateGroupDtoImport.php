<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\DataImport;
use App\Models\MachineStateGroup;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class MachineStateGroupDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:machine_state_groups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run external import/basevisu v10 synchronization for machine state groups';

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
        while ($chunk = $ds->machineStateGroupDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $machineStateGroup) {
                // we will update one xml id only one time
                // keep unique ids
                if (isset($machineStateGroup->xml_id) && !in_array($machineStateGroup->xml_id, $xmlIds)) {
                    $xmlIds[] = $machineStateGroup->xml_id;
                }
                $record = MachineStateGroup::where('custom_id', $machineStateGroup->custom_id)->first();
                if (!$record) {
                    if (!(isset($machineStateGroup->is_active) && $machineStateGroup->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }
                    $record = new MachineStateGroup();
                    $record->custom_id = $machineStateGroup->custom_id;
                    $record->is_active = true;
                }

                $record->name = $machineStateGroup->name ?? $record->name;
                $record->is_active = $machineStateGroup->is_active ?? $record->is_active;
                $record->save();
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            //TODO: SYNC TO V10 missing
        }
        return 0;
    }
}
