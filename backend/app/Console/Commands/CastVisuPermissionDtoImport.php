<?php

namespace App\Console\Commands;

use App\Enums\BaseVisu\PermissionEnum;
use App\Http\Controllers\ExternalDataSourceController;
use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Spatie\Permission\Models\Permission;

class CastVisuPermissionDtoImport extends Command
{
    use DispatchesJobs;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:castvisupermission';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import all user castvisu permissions from v10 DB';

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

        $mappedUserList = [];
        $users = User::with('permissions')->get();
        foreach ($users as $user) {
            // get existing permissions
            $prevPermissions = $user->permissions->pluck('name')->toArray();

            // remove existing castvisu permissions
            $prevPermissions = array_filter($prevPermissions, function($el) {
                return stripos($el, "castvisu") === false;
            });
            // get CASTVISU_VIEWER permission as default
            $defaultPermission = Permission::where('name', PermissionEnum::CASTVISU_VIEWER()->value)->first();
            if($defaultPermission && !in_array($defaultPermission->name, $prevPermissions)){
                // set CASTVISU_VIEWER as default permission
                $user->syncPermissions([...$prevPermissions, $defaultPermission->name]);
            }
            $mappedUserList[$user->custom_id] = $user;
        }

        while ($chunk = $ds->permissionsByModuleNameDtos('CAST_VISU', $skip, $take)) {
            $skip += $take;
            foreach ($chunk as $permission) {
                $selectedUser = isset($mappedUserList[$permission->user_id_custom]) ? $mappedUserList[$permission->user_id_custom] : null;
                if (!$selectedUser) {
                    continue;
                }
                // get existing permissions
                $prevPermissions = $selectedUser->permissions->pluck('name')->toArray();
                // remove existing castvisu permissions
                $prevPermissions = array_filter($prevPermissions, function($el) {
                    return stripos($el, "castvisu") === false;
                });
                $castPermission = $selectedUser->getPermissionBasedOnCastVisuPermissionIDForV10($permission->permission);
                if($castPermission) {
                    $selectedUser->syncPermissions([...$prevPermissions, $castPermission->name]);
                }
            }
        }

        return 0;
    }
}
