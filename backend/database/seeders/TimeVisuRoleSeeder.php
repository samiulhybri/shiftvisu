<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TimeVisuRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createAdminRole();
        $this->createViewerRole();
    }

    /**
     * Create an Admin Role
     * Then assign all permissions to the Time Visu Admin
     */
    private function createAdminRole()
    {
        $adminTimeVisuRole = Role::firstOrCreate(['name' => 'TIMEVISU_ADMIN']);

        $permissions = [
            PermissionEnum::TIMEVISU_VIEW()->value,
            PermissionEnum::TIMEVISU_ADMIN()->value,
            PermissionEnum::TIMEVISU_TIME_RECORD_VIEW()->value,
            PermissionEnum::TIMEVISU_TIME_RECORD_EDIT()->value,
            PermissionEnum::TIMEVISU_REPORT_HOURS_TOOLVISU()->value,
            PermissionEnum::TIMEVISU_REPORT_HOURS_EMPLOYEE()->value,
            PermissionEnum::TIMEVISU_REPORTS_HOURS_PROJECTS()->value,
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $adminTimeVisuRole->givePermissionTo($permission);
        }
    }

    /**
     * Create a TimeVisu Viewer Role
     * Then assign all view related permissions to that role regarding Time Visu
     */
    private function createViewerRole()
    {
        $adminTimeVisuRole = Role::firstOrCreate(['name' => 'TIMEVISU_VIEWER']);

        $permissions = [
            PermissionEnum::TIMEVISU_VIEW()->value,
            PermissionEnum::TIMEVISU_TIME_RECORD_VIEW()->value,
            PermissionEnum::TIMEVISU_REPORT_HOURS_TOOLVISU()->value,
            PermissionEnum::TIMEVISU_REPORT_HOURS_EMPLOYEE()->value,
            PermissionEnum::TIMEVISU_REPORTS_HOURS_PROJECTS()->value,
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $adminTimeVisuRole->givePermissionTo($permission);
        }
    }
}
