<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\TpmGroupImport as JobsTpmGroupImport;
use App\Models\TpmGroup;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class TpmGroupDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:tpmgroup';

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
        $sourceCustomIds = [];
        $xmlIds = [];

        while ($chunk = $ds->tpmGroupDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $tpmGroup) {
                $sourceCustomIds[] = $tpmGroup->custom_id;
                // we will update one xml id only one time
                // keep unique ids
                if (isset($tpmGroup->xml_id) && !in_array($tpmGroup->xml_id, $xmlIds)) {
                    $xmlIds[] = $tpmGroup->xml_id;
                }
                $record = TpmGroup::where('custom_id', $tpmGroup->custom_id)->first();
                if (!$record) {
                    $record = new TpmGroup();
                    $record->custom_id = $tpmGroup->custom_id;
                }

                $record->name = $tpmGroup->name ?? '';
                $record->is_imported_from_erp = 1;

                $record->save();
            }
        }

        // Now we will handle the deletion
        // delete the rows that are not exists in their ERP anymore
        // make then not active
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            TpmGroup::whereNotIn('custom_id', $sourceCustomIds)->where('is_imported_from_erp', '=', 1)->update(['is_active' => 0]);
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            // var $sourceCustomIds need to delete also from v10 base visu
            $this->dispatch(new JobsTpmGroupImport('t_base_combo', env('DELETE_WHEN_SYNC_DATA'), $sourceCustomIds));
        }
        return 0;
    }
}
