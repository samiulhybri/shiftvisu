<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class SuperAdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::beginTransaction();

        try {
            $user = User::firstOrCreate([
                'custom_id' => '-9999',
                'name' => 'Administrator',
                'email' => 'admin@schertech.com',
                'chip_number' => '',
                'is_active' => 1,
                'username' => 'admin',
                'is_melter' => 1,
                'is_mp_offer_user' => 1,
                'is_mp_offer_admin' => 1,
                'mp_is_allowed_reoffer' => 1,
                'is_supervisor' => 1,
                'user_type' => 'Admin',
                'is_absence_manager_admin' => 1,
                'ip_address' => null,
                'password' => password_hash('admin@schertech', PASSWORD_DEFAULT),
                'is_imported_from_erp' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $user->assignRole('SUPERADMIN');

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
}