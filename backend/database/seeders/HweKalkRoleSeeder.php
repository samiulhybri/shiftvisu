<?php

namespace Database\Seeders;

use App\Enums\BaseVisu\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class HweKalkRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = ['ADMIN', 'Sachbearbeiter Vertrieb', 'Vertr.assistenz', 'Vertr.assistenz', 'Kalkulation', 'Technische Beurteilung', 'Kalkulation Mech. Bearb.', 'AV', 'QS/WBH'];
        foreach ($roles as $key => $role) {
            $createdRole = Role::firstOrCreate(['name' => $role, 'guard_name' => 'api']);
            if ($key === 0) {
                $permissions = Permission::pluck('name');
                $createdRole->givePermissionTo($permissions);
            }
        }
        $this->giveSachbearbeiterVertriebermission();
        $this->giveVertrAssistenzPermission();
        $this->giveKalkulationPermission();
        $this->giveTechnischeBeurteilungPermission();
        $this->giveKalkulationMechPermission();
        $this->giveAvPermission();
        $this->giveQsPermission();
    }

    protected function giveSachbearbeiterVertriebermission()
    {
        $SachbearbeiterVertrieb = [
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_VIEW(),
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_IMPORT(),
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_CREATE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_COPY(),
            PermissionEnum::HWEKALK_SALES_VIEW(),
            PermissionEnum::HWEKALK_SALES_COSTS_VIEW(),
            PermissionEnum::HWEKALK_SALES_COSTS_GENERATE(),
            PermissionEnum::HWEKALK_SALES_COSTS_NEW(),
            PermissionEnum::HWEKALK_SALES_COSTS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_QUOTATION_CREATION_VIEW(),
            PermissionEnum::HWEKALK_OBTAIN_EXTERNAL_VIEW(),
            PermissionEnum::HWEKALK_OFFER_CREATE(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_EDIT(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_INDIVIDUAL_ASSESSMENT_EDIT(),
            PermissionEnum::HWEKALK_HEAT_TREATMENT_READ_ONLY(),
            PermissionEnum::HWEKALK_CUSTOMER_REQUEST_READ_ONLY(),
            PermissionEnum::HWEKALK_DIMENSION_READ_ONLY(),
            PermissionEnum::HWEKALK_WORK_PLAN_READ_ONLY(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_SALES_ACTION(),
            PermissionEnum::HWEKALK_SALES_EDIT(),
            PermissionEnum::HWEKALK_SALES_VIEW(),
            PermissionEnum::HWEKALK_OFFER_CRM_UPLOAD(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),
        ];
        $role = Role::where('name', 'Sachbearbeiter Vertrieb')->first();
        foreach ($SachbearbeiterVertrieb as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }

    protected function giveVertrAssistenzPermission()
    {
        $vertrAssistenz = [
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_VIEW(),
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_IMPORT(),
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_SALES_VIEW(),
            PermissionEnum::HWEKALK_OFFER_CREATE(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_CREATE(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_INDIVIDUAL_ASSESSMENT_READ_ONLY(),
            PermissionEnum::HWEKALK_CUSTOMER_REQUEST_READ_ONLY(),
            PermissionEnum::HWEKALK_DIMENSION_READ_ONLY(),
            PermissionEnum::HWEKALK_WORK_PLAN_READ_ONLY(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),

        ];
        $role = Role::where('name', 'Vertr.assistenz')->first();
        foreach ($vertrAssistenz as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }

    protected function giveKalkulationPermission()
    {
        $kalkulation = [
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_VIEW(),
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_IMPORT(),
            PermissionEnum::HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_CREATE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_COPY(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_CALC_VIEW(),
            PermissionEnum::HWEKALK_OFFER_CREATE(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_EDIT(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_CREATE(),
            PermissionEnum::HWEKALK_INDIVIDUAL_ASSESSMENT_EDIT(),
            PermissionEnum::HWEKALK_HEAT_TREATMENT_EDIT(),
            PermissionEnum::HWEKALK_CUSTOMER_REQUEST_EDIT(),
            PermissionEnum::HWEKALK_DIMENSION_EDIT(),
            PermissionEnum::HWEKALK_WORK_PLAN_EDIT(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_SALES_ACTION(),
            PermissionEnum::HWEKALK_SALES_EDIT(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),
        ];
        $role = Role::where('name', 'Kalkulation')->first();
        foreach ($kalkulation as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }

    public function giveTechnischeBeurteilungPermission()
    {
        $technischeBeurteilung = [
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_TECHINCAL_ASSESSMENT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_EDIT(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_INDIVIDUAL_ASSESSMENT_EDIT(),
            PermissionEnum::HWEKALK_HEAT_TREATMENT_EDIT(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_SALES_EDIT(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_SPECIFICATIONS_EDIT(),
            PermissionEnum::HWEKALK_MATERIALS_EDIT(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),

        ];
        $role = Role::where('name', 'Technische Beurteilung')->first();
        foreach ($technischeBeurteilung as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }

    protected function giveKalkulationMechPermission()
    {
        $kalkulationMech = [
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_CALC_MECHANIC_VIEW(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_EDIT(),
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_HEAT_TREATMENT_EDIT(),
            PermissionEnum::HWEKALK_CUSTOMER_REQUEST_EDIT(),
            PermissionEnum::HWEKALK_WORK_PLAN_EDIT(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_SALES_EDIT(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),
        ];

        $role = Role::where('name', 'Kalkulation Mech. Bearb.')->first();
        foreach ($kalkulationMech as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }

    protected function giveAvPermission()
    {
        $AV = [
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_WORK_PLAN_EDIT(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_MATERIALS_EDIT(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_RELEASED_EDIT(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),
        ];

        $role = Role::where('name', 'AV')->first();
        foreach ($AV as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }

    protected function giveQsPermission()
    {
        $QS = [
            PermissionEnum::HWEKALK_OFFER_POS_VIEW(),
            PermissionEnum::HWEKALK_OFFER_VIEW(),
            PermissionEnum::HWEKALK_TECHINCAL_ASSESSMENT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_ARCHIVED_BUTTON_VIEW(),
            PermissionEnum::HWEKALK_OFFER_SEARCH_INPUT_VIEW(),
            PermissionEnum::HWEKALK_OFFER_POS_DELETE(),
            PermissionEnum::HWEKALK_OFFER_POS_EDIT(),
            PermissionEnum::HWEKALK_HEAT_TREATMENT_EDIT(),
            PermissionEnum::HWEKALK_WORK_PLAN_EDIT(),
            PermissionEnum::HWEKALK_SUMMARY_VIEW(),
            PermissionEnum::HWEKALK_OFFER_LOG_VIEW(),
            PermissionEnum::HWEKALK_SPECIFICATIONS_EDIT(),
            PermissionEnum::HWEKALK_MATERIALS_EDIT(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_VIEW(),
            PermissionEnum::HWEKALK_CLIENT_ORDER_HEAT_TREATMENTS_EDIT(),
            PermissionEnum::HWEKALK_MATERIAL_DATABASES_EDIT(),
            PermissionEnum::HWEKALK_EVALUATION_VIEW(),
        ];
        $role = Role::where('name', 'QS/WBH')->first();
        foreach ($QS as $permission) {
            $role->givePermissionTo($permission->value);
        }
    }
}



