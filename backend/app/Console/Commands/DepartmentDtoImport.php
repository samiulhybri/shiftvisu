<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Jobs\DepartmentImport as JobsDepartmentImport;
use App\Models\Department;
use App\Models\Hall;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;

class DepartmentDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:department';

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
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');

        $sourceCustomIds = [];

        while ($chunk = $ds->departmentDtos($skip, $take)) {
            $skip += $take;
            foreach ($chunk as $department) {
                $sourceCustomIds[] = $department->custom_id;
                $record = Department::where([
                    'custom_id' => $department->custom_id
                ])->first();

                if (!$record) {
                    if (!(isset($department->is_active) && $department->is_active)) {
                        //Do not create new records if they are anyways not active
                        continue;
                    }

                    $record = new Department();
                    $record->custom_id = $department->custom_id;
                    $record->name = $department->name;
                    $record->is_active = $department->is_active;
                }

                $record->name = $department->name ?? $record->name;
                $record->is_active = $department->is_active ?? $record->is_active;
                $record->is_imported_from_erp = 1;
                $record->save();

                $newDepartment = Department::where([
                    'custom_id' => $department->custom_id
                ])->first();

                $newDepartment->halls()->detach();

                foreach ($department->hall_ids_custom as $hallCustomId) {
                    $hall = Hall::where(['custom_id' => $hallCustomId])->first();
                    if ($hall) $newDepartment->halls()->attach($hall->id);
                }
            }
        }

        // Now we will handle the deletion
        // delete the rows that are not exists in their ERP anymore
        if (env('DELETE_WHEN_SYNC_DATA') == true) {
            Department::whereNotIn('custom_id', $sourceCustomIds)->where('is_imported_from_erp', '=', 1)->update(['is_active' => 0]);
        }

        if (env('EXTERNAL_DS_TARGET') == env('ENABLE_JOB_FOR')) {
            $this->dispatch((new JobsDepartmentImport('t_base_combo', 19, env('DELETE_WHEN_SYNC_DATA'), $sourceCustomIds)));
        }

        return 0;
    }
}
