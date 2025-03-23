<?php

namespace Database\Seeders;


use App\Enums\BaseVisu\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = PermissionEnum::toArray();

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        foreach (Permission::all() as $permission) {
            if (!in_array($permission->name, $permissions)) {
                $permission->delete();
            }
        }
    }
}
