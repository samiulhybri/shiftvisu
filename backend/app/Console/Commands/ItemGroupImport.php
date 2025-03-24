<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\ItemGroup;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class ItemGroupImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:itemgroups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all item groups from source system';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();

        $itemGroups = $ds->itemGroups();

        foreach ($itemGroups as $itemGroupsChunks) {
            foreach ($itemGroupsChunks as $itemGroup) {
                $record = ItemGroup::where('custom_id', $itemGroup['custom_id'])->first();

                if (!$record) {
                    if (isset($itemGroup['is_active']) && !$itemGroup['is_active']) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }

                    $record = new ItemGroup();
                    $record->custom_id = $itemGroup['custom_id'];
                    $record->is_active = true;
                }

                FieldChecker::setField('name', $record, $itemGroup, $record->name);
                FieldChecker::setField('is_active', $record, $itemGroup, $record->is_active);

                $record->is_imported_from_erp = $itemGroup['is_imported_from_erp'];
                $record->save();
            }
        }

        //TODO: File needs to be created by Dhaka office plus table not there yet in v10 it looks like
        /* if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch(new JobsItemGroupImport('NEW_TABLE_DOESN_T_EXIST_YET'));
        } */

        return 0;
    }
}
