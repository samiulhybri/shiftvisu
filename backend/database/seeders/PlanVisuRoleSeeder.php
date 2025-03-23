<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Enums\BaseVisu\PermissionEnum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PlanVisuRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createAdminRole();
        $this->createViewerRole();
    }

    private function createAdminRole()
    {
        $adminPlanVisuRole = Role::firstOrCreate(['name' => 'PLANVISU_ADMIN']);

        $permissions = [
            PermissionEnum::PLANVISU_VIEW()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_PRODUCTION_PLAN_PAGE_EDIT()->value,
            PermissionEnum::PRODUCTION_PLAN_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_MACHINE_SCHEDULAR_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_MACHINE_SCHEDULAR_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_USER_SCHEDULAR_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_USER_SCHEDULAR_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_RANGE_OVERVIEW_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_ORDER_CREATE_PAGE_EDIT()->value,
            PermissionEnum::PLANVISU_ORDER_CREATE_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_STAFF_NEEDED_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_STAFF_WORKLOAD_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_MACHINE_WORKLOAD_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_ORDER_VIEW()->value,
            PermissionEnum::PLANVISU_SET_UP_PLAN_VIEW()->value,
            PermissionEnum::PLANVISU_EXPORT_IMPORT_VIEW()->value,
            PermissionEnum::PLANVISU_SET_UP_PLAN_EDIT()->value,
            PermissionEnum::PLANVISU_EXPORT_IMPORT_EDIT()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_DELETE()->value,
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $adminPlanVisuRole->givePermissionTo($permission);
        }
    }

    private function createViewerRole()
    {
        $viewerPlanVisuRole = Role::firstOrCreate(['name' => 'PLANVISU_VIEWER']);

        $permissions = [
            PermissionEnum::PLANVISU_VIEW()->value,
            PermissionEnum::PLANVISU_GANTT_CHART_PAGE_VIEW()->value,
            PermissionEnum::PRODUCTION_PLAN_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_MACHINE_SCHEDULAR_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_USER_SCHEDULAR_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_RANGE_OVERVIEW_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_ORDER_CREATE_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_STAFF_NEEDED_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_STAFF_WORKLOAD_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_MACHINE_WORKLOAD_PAGE_VIEW()->value,
            PermissionEnum::PLANVISU_ORDER_VIEW()->value,
            PermissionEnum::PLANVISU_SET_UP_PLAN_VIEW()->value,
            PermissionEnum::PLANVISU_EXPORT_IMPORT_VIEW()->value
        ];

        foreach($permissions as $permissionName) {
            $permission = Permission::firstOrCreate(['name' => $permissionName]);
            $viewerPlanVisuRole->givePermissionTo($permission);
        }
    }
}
