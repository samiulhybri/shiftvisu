<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Hall;
use Illuminate\Console\Command;
use App\Jobs\HallImport as JobsHallImport;
use Illuminate\Foundation\Bus\DispatchesJobs;

class HallDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:hall';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all halls from source system';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        while ($chunk = $ds->hallDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $hall) {
                $record = Hall::where('custom_id', $hall->custom_id)->first();

                if (!$record) {
                    if (!(isset($hall->is_active) && $hall->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }

                    $record = new Hall();
                    $record->custom_id = $hall->custom_id;
                    $record->is_active = true;
                    $record->is_enabled_plan_visu = false;
                }

                $record->name = $hall->name ?? $record->name;
                $record->is_enabled_plan_visu = $hall->is_enabled_plan_visu ?? $record->is_enabled_plan_visu;
                $record->is_active = $hall->is_active ?? $record->is_active;

                $record->save();
            }
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new JobsHallImport('sd_halle'));
        }

        return 0;
    }
}
