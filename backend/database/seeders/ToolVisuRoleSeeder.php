<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ToolVisuRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->givePermissionsToAdmin();
        
        $this->createViewerRole();
        $this->createOrderHistoryEditRole();
    }

    private function givePermissionsToAdmin()
    {
        $adminToolVisuRole = Role::firstOrCreate(['name' => 'TOOLVISU_ADMIN']);

        $permissions = [
            PermissionEnum::TOOLVISU_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_REPAIR_EDIT()->value,
            PermissionEnum::TOOLVISU_TOOL_REPAIR_VIEW()->value,
            PermissionEnum::TOOLVISU_PLANNED_ORDERS_EDIT()->value,
            PermissionEnum::TOOLVISU_PLANNED_ORDERS_VIEW()->value,
            PermissionEnum::TOOLVISU_REPAIR_HISTORY_VIEW()->value,
            PermissionEnum::TOOLVISU_ORDER_HISTORY_EDIT()->value,
            PermissionEnum::TOOLVISU_ORDER_HISTORY_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_OVERVIEW_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_SCHEDULE_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_SCHEDULE_EDIT()->value,
            PermissionEnum::TOOLVISU_SETTINGS_EDIT()->value,
            PermissionEnum::TOOLVISU_SETTINGS_VIEW()->value,
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $adminToolVisuRole->givePermissionTo($permission);
        }
    }

    /**
     * Create a ToolVisu Viewer Role
     * Then assign all view related permissions to that role regarding Tool Visu
     */
    private function createViewerRole()
    {
        $adminToolVisuRole = Role::firstOrCreate(['name' => 'TOOLVISU_VIEWER']);

        $permissions = [
            PermissionEnum::TOOLVISU_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_REPAIR_VIEW()->value,
            PermissionEnum::TOOLVISU_PLANNED_ORDERS_VIEW()->value,
            PermissionEnum::TOOLVISU_REPAIR_HISTORY_VIEW()->value,
            PermissionEnum::TOOLVISU_ORDER_HISTORY_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_OVERVIEW_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_SCHEDULE_VIEW()->value,
            PermissionEnum::TOOLVISU_SETTINGS_VIEW()->value,
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $adminToolVisuRole->givePermissionTo($permission);
        }
    }

    /**
     * Create a ToolVisu Special Edit Role
     * Then assign all view related permissions to that role regarding Tool Visu
     */
    private function createOrderHistoryEditRole()
    {
        $adminToolVisuRole = Role::firstOrCreate(['name' => 'TOOLVISU_ORDER_HISTORY_EDIT']);

        $permissions = [
            PermissionEnum::TOOLVISU_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_REPAIR_VIEW()->value,
            PermissionEnum::TOOLVISU_PLANNED_ORDERS_VIEW()->value,
            PermissionEnum::TOOLVISU_REPAIR_HISTORY_VIEW()->value,
            PermissionEnum::TOOLVISU_ORDER_HISTORY_EDIT()->value,
            PermissionEnum::TOOLVISU_ORDER_HISTORY_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_OVERVIEW_VIEW()->value,
            PermissionEnum::TOOLVISU_TOOL_SCHEDULE_VIEW()->value,
            PermissionEnum::TOOLVISU_SETTINGS_VIEW()->value,
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $adminToolVisuRole->givePermissionTo($permission);
        }
    }
}
