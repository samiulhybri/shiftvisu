<?php

namespace App\Console\Commands;

use App\Console\Commands\Helper\FieldChecker;
use App\Http\Controllers\ExternalDataSourceController;
use App\Models\Hall;
use App\Models\UserGroup;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class UserGroupImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:usergroups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all user groups from source system';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();

        $userGroups = $ds->userGroups();

        $halls = collect();
        foreach (Hall::all() as $hall) {
            $halls[$hall->custom_id] = $hall->id;
        }

        foreach ($userGroups as $userGroupsChunks) {
            foreach ($userGroupsChunks as $userGroup) {
                $record = UserGroup::where('custom_id', $userGroup['custom_id'])->first();

                if (!$record) {
                    if (isset($userGroup['is_active']) && !$userGroup['is_active']) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }

                    $record = new UserGroup();
                    $record->custom_id = $userGroup['custom_id'];
                    $record->is_active = true;
                }

                FieldChecker::setField('name', $record, $userGroup, $record->name);
                FieldChecker::setField('is_active', $record, $userGroup, $record->is_active);

                if (isset($userGroup['hall_custom_id']) && $halls->has($userGroup['hall_custom_id'])) {
                    $record->hall_id = $halls[$userGroup['hall_custom_id']];
                }

                $record->is_imported_from_erp = $userGroup['is_imported_from_erp'];
                $record->save();
            }
        }

        return 0;
    }
}
