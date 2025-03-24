<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $superAdminRole = Role::firstOrCreate(['name' => 'SUPERADMIN', 'guard_name' => 'api']);
        $permissions = Permission::pluck('name');
        $superAdminRole->givePermissionTo($permissions);
    }
}
