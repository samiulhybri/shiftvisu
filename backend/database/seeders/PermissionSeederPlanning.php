<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use App\Helpers\PermissionSeederHelper;
use Illuminate\Database\Seeder;

class PermissionSeederPlanning extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = PermissionEnum::toArray();
        $modules = ['PLANVISU'];
        $excludePatterns = [];

        PermissionSeederHelper::syncFilteredPermissions($permissions, $modules, $excludePatterns);
    }
}
