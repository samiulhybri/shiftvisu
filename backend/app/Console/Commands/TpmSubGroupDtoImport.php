<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\TpmSubGroupImport as JobsTpmSubGroupImport;
use App\Models\TpmGroup;
use App\Models\TpmSubGroup;
use App\Models\DataImport;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class TpmSubGroupDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:tpmsubgroup';

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
        $xmlIds = [];
        $sourceCustomIds = [];

        $tpmGroups = TpmGroup::get()->toArray();
        $tpmGroupIdMap = [];

        foreach ($tpmGroups as $tpmGroup) {
            $tpmGroupIdMap[$tpmGroup['custom_id']] = $tpmGroup['id'];
        }

        while ($chunk = $ds->tpmSubGroupDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $tpmSubGroup) {
                $sourceCustomIds[] = $tpmSubGroup->custom_id;
                // we will update one xml id only one time
                // keep unique ids
                if (isset($tpmSubGroup->xml_id) && !in_array($tpmSubGroup->xml_id, $xmlIds)) {
                    $xmlIds[] = $tpmSubGroup->xml_id;
                }
                $record = TpmSubGroup::where('custom_id', $tpmSubGroup->custom_id)->first();
                if (!$record) {
                    $record = new TpmSubGroup();
                    $record->custom_id = $tpmSubGroup->custom_id;
                }

                $record->name = $tpmSubGroup->name ?? '';

                if (isset($tpmSubGroup->tpm_group_id_custom) && isset($tpmGroupIdMap[$tpmSubGroup->tpm_group_id_custom])) {
                    $record->tpm_group_id = $tpmGroupIdMap[$tpmSubGroup->tpm_group_id_custom];
                } else {
                    $record->tpm_group_id = NULL;
                }
                $record->is_imported_from_erp = 1;

                $record->save();
            }
        }

        // Now we will handle the deletion
        // delete the rows that are not exists in their ERP anymore
        // make then not active
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            TpmSubGroup::whereNotIn('custom_id', $sourceCustomIds)->where('is_imported_from_erp', '=', 1)->update(['is_active' => 0]);
        }

        if (count($xmlIds) > 0) {
            DataImport::whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        // For now only for skt we will create job.
        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR') && (env('EXTERNAL_DS_TARGET') == 'skt') || env('EXTERNAL_DS_TARGET') == 'at') {
            $this->dispatch(new JobsTpmSubGroupImport('t_base_combo', env('DELETE_WHEN_SYNC_DATA'), $sourceCustomIds));
        }
        return 0;
    }
}
