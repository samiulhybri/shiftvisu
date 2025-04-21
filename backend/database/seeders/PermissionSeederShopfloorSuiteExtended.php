<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use App\Helpers\PermissionSeederHelper;
use Illuminate\Database\Seeder;

class PermissionSeederShopfloorSuiteExtended extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = PermissionEnum::toArray();
        $modules = ['LEANVISU', 'TPMVISU', 'QUALIVISU', 'TOOLVISU', 'TIMEVISU', 'MAINTENANCE'];
        $excludePatterns = [];

        PermissionSeederHelper::syncFilteredPermissions($permissions, $modules, $excludePatterns);
    }
}
