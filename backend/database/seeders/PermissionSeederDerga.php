<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use App\Helpers\PermissionSeederHelper;
use Illuminate\Database\Seeder;

class PermissionSeederDerga extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = PermissionEnum::toArray();
        $modules = ['BASEVISU', 'STATUSBOARD', 'INTERFACE_MONITORING' , 'MACHINEBOARD', 'LOGIVISU', 'QUALIVISU', 'DATA_EXPORTS', 'COMMAND_SCHEDULES', 'CLOSED_OPERATIONS']; // No prefix for interface
        $excludePatterns = ['QUALIVISU_8D', 'BASEVISU_ENERGY', 'HWE'];

        PermissionSeederHelper::syncFilteredPermissions($permissions, $modules, $excludePatterns);
    }
}
