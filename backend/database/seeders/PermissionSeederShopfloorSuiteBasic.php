<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use App\Helpers\PermissionSeederHelper;
use Illuminate\Database\Seeder;

class PermissionSeederShopfloorSuiteBasic extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = PermissionEnum::toArray();
        $modules = ['BASEVISU', 'STATUSBOARD', 'PERSONALVISU', 'REPORTVISU', 'SHIFTVISU', 'TASKVISU', 'DOCVISU', 'INTERFACE_MONITORING', 'MACHINEBOARD', 'DATA_EXPORTS', 'COMMAND_SCHEDULES', 'CLOSED_OPERATIONS']; // No prefix for interface
        $excludePatterns = ['BASEVISU_ENERGY', 'MACHINEBOARD_QUALIVISU'];

        PermissionSeederHelper::syncFilteredPermissions($permissions, $modules, $excludePatterns);
    }
}