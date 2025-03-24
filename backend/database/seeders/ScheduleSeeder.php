<?php

namespace Database\Seeders;

use App\Console\Commands\AutoClockOut;
use App\Console\Commands\BacklogCalculate;
use App\Console\Commands\BomDtoImport;
use App\Console\Commands\BomFlatten;
use App\Console\Commands\BuildMachineRegisteredTimesTable;
use App\Console\Commands\BuildUserRegisteredTimesTable;
use App\Console\Commands\CallOffDtoImport;
use App\Console\Commands\CapacityDtoImport;
use App\Console\Commands\CastVisuPermissionDtoImport;
use App\Console\Commands\ClassificationDtoImport;
use App\Console\Commands\CostCenterDtoImport;
use App\Console\Commands\CrmCustomerExport;
use App\Console\Commands\CustomerDtoImport;
use App\Console\Commands\DeleteExportedData;
use App\Console\Commands\DeleteImportedData;
use App\Console\Commands\DepartmentDtoImport;
use App\Console\Commands\EquipmentDtoImport;
use App\Console\Commands\ExportData;
use App\Console\Commands\FcmTokenCleanup;
use App\Console\Commands\HallDtoImport;
use App\Console\Commands\HandlingUnitDtoImport;
use App\Console\Commands\ItemDtoImport;
use App\Console\Commands\ItemGroupDtoImport;
use App\Console\Commands\ItemStateDtoImport;
use App\Console\Commands\MachineDtoImport;
use App\Console\Commands\MachineGroupDtoImport;
use App\Console\Commands\MachineProdOrderPosOperationTimeDtoImport;
use App\Console\Commands\MachineStateDtoImport;
use App\Console\Commands\MachineStateGroupDtoImport;
use App\Console\Commands\MachineStateTimeDtoImport;
use App\Console\Commands\MachineUserTimeDtoImport;
use App\Console\Commands\OffDayDtoImport;
use App\Console\Commands\OperationPlanDtoImport;
use App\Console\Commands\PackagingInstructionDtoImport;
use App\Console\Commands\ProdOrderDtoImport;
use App\Console\Commands\ProdOrderExport;
use App\Console\Commands\ProductionSupplyAreaDtoImport;
use App\Console\Commands\QualificationDtoImport;
use App\Console\Commands\QualificationsUpdate;
use App\Console\Commands\ResourceGroupDtoImport;
use App\Console\Commands\SalesOrderDtoImport;
use App\Console\Commands\SettingsDtoImport;
use App\Console\Commands\ShiftDtoImport;
use App\Console\Commands\ShiftModelDtoImport;
use App\Console\Commands\SimulateMachineEvent;
use App\Console\Commands\StockDtoImport;
use App\Console\Commands\StorageBinDtoImport;
use App\Console\Commands\SupplierDtoImport;
use App\Console\Commands\ToolDtoImport;
use App\Console\Commands\TpmGroupDtoImport;
use App\Console\Commands\TpmSubGroupDtoImport;
use App\Console\Commands\UpdateMpCostName;
use App\Console\Commands\UserDtoImport;
use App\Console\Commands\UserGroupDtoImport;
use App\Console\Commands\WarehouseDtoImport;
use App\Console\Commands\CrmKanbanCurrentDate;
use App\Models\CommandSchedule;
use App\Console\Commands\MachineOutputCalculate;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imports = [
            AutoClockOut::class,
            BacklogCalculate::class,
            BomDtoImport::class,
            BomFlatten::class,
            BuildMachineRegisteredTimesTable::class,
            BuildUserRegisteredTimesTable::class,
            CallOffDtoImport::class,
            CapacityDtoImport::class,
            CastVisuPermissionDtoImport::class,
            ClassificationDtoImport::class,
            CostCenterDtoImport::class,
            CrmCustomerExport::class,
            CustomerDtoImport::class,
            DeleteExportedData::class,
            DeleteImportedData::class,
            DepartmentDtoImport::class,
            ExportData::class,
            FcmTokenCleanup::class,
            HallDtoImport::class,
            HandlingUnitDtoImport::class,
            ItemDtoImport::class,
            ItemGroupDtoImport::class,
            ItemStateDtoImport::class,
            MachineDtoImport::class,
            MachineGroupDtoImport::class,
            MachineProdOrderPosOperationTimeDtoImport::class,
            MachineStateDtoImport::class,
            MachineStateGroupDtoImport::class,
            MachineStateTimeDtoImport::class,
            MachineUserTimeDtoImport::class,
            OffDayDtoImport::class,
            OperationPlanDtoImport::class,
            PackagingInstructionDtoImport::class,
            ProdOrderDtoImport::class,
            ProdOrderExport::class,
            ProductionSupplyAreaDtoImport::class,
            QualificationDtoImport::class,
            QualificationsUpdate::class,
            ResourceGroupDtoImport::class,
            SalesOrderDtoImport::class,
            SettingsDtoImport::class,
            ShiftDtoImport::class,
            ShiftModelDtoImport::class,
            SimulateMachineEvent::class,
            StockDtoImport::class,
            StorageBinDtoImport::class,
            SupplierDtoImport::class,
            ToolDtoImport::class,
            TpmGroupDtoImport::class,
            TpmSubGroupDtoImport::class,
            UpdateMpCostName::class,
            UserDtoImport::class,
            UserGroupDtoImport::class,
            WarehouseDtoImport::class,
            EquipmentDtoImport::class,
            MachineOutputCalculate::class,
            CrmKanbanCurrentDate::class,
        ];

        $previousConfig = [
            "sct" => [
                "import:costcenter" => "0    2 * * *",
                "import_dto:costcenter" => "0    2 * * *",

                // previous base data imports
                "import:machinegroup" => "0    2 * * *",
                "import_dto:machinegroup" => "0    2 * * *",
                "import:hall" => "0    2 * * *",
                "import_dto:hall" => "0    2 * * *",
                "import:resourcegroup                                                                                                                                                                         " => "0    2 * * *",
                "import_dto:resourcegroup" => "0    2 * * *",
                "import_dto:machine" => "0    2 * * *",
                "import:itemgroups" => "0    2 * * *",
                "import_dto:itemgroups" => "0    2 * * *",
                "import_dto:item" => "0    2 * * *",
                "import:classification" => "0    2 * * *",
                "import_dto:classification" => "0    2 * * *",
                "import:bom" => "0    2 * * *",
                "import_dto:bom" => "0    2 * * *",
                "import:item_states" => "0    2 * * *",
                "import_dto:item_states" => "0    2 * * *",
                "import:machine_state_groups" => "0    2 * * *",
                "import_dto:machine_state_groups" => "0    2 * * *",
                "import:machine_states" => "0    2 * * *",
                "import_dto:machine_states" => "0    2 * * *",
                "import_dto:department" => "0    2 * * *",
                "import:tool" => "0    2 * * *",
                "import_dto:tool" => "0    2 * * *",
                "import:operationplan" => "0    2 * * *",
                "import_dto:operationplan" => "0    2 * * *",
                "import:warehouse" => "0    2 * * *",
                "import_dto:warehouse" => "0    2 * * *",
                "import_dto:storage_bin" => "0    2 * * *",
                "bom:flatten" => "0    2 * * *",
                "import_dto:shift" => "0    2 * * *",
                "import_dto:shiftmodel" => "0    2 * * *",
                "import_dto:capacity" => "0    2 * * *",
                "import:customer" => "0    2 * * *",
                "import_dto:customer" => "0    2 * * *",
                "import:supplier" => "0    2 * * *",
                "import_dto:supplier" => "0    2 * * *",
                "import:castvisupermission" => "0    2 * * *",

                "import:salesorder" => "0    * * * *",
                "import_dto:salesorder" => "0    * * * *",
                "import:prodorder" => "0,30 * * * *",
                "import_dto:prodorder" => "0,30 * * * *",
                "jpi:import_halls" => "0    2 * * *",
                "jpi:import_machines" => "0    2 * * *",
                "jpi:import_users" => "0    2 * * *",
                "jpi:upload_resource_categories" => "0    2 * * *",
                "jpi:upload_resource_groups" => "0    2 * * *",
                "jpi:upload_resources" => "0    2 * * *",
                "jpi:import_prod_orders" => "*/5  * * * *",
                "jpi:upload_progress_jobs" => "*/5  * * * *",
                "jpi:upload_progress_jobs_prepared" => "*/5  * * * *",
                "jpi:upload_jobs" => "0    2 * * *",
                "jpi:download_jobs" => "*/5  * * * *",
                "jpi:update_mes" => "*/5  * * * *",
                "prodorder:export" => "*/5  * * * *",
                "jpi:update-planning-start" => "1    0 * * *",
                "import:calloff" => "0    * * * *",
                "import:stock" => "0    * * * *",
                "import_dto:stock" => "0    * * * *",
                "read:energy_meters" => "*    * * * *",
                "read:energy_consumption" => "0    * * * *",
                "sanctum:prune-expired --hours=1" => "0    0 * * *",
                "fcm_tokens:cleanup_stale" => "0    0 * * 0",
                "filter:unsaved-entries" => "0    2 * * *",
                "export:data" => "*    * * * *",
                "import:machine_user_times" => "*    * * * *",
                "app:hwe-qs-certificate-pdf-delete" => "0    3 * * *",
                "data-imports:delete-imported" => "0    2 * * *",
                "data-exports:delete-exported" => "0    2 * * *",
                "machine-output:calculate" => "0    2 * * *",
            ],
            "sap" => [
                "import:costcenter" => "0    2 * * *",
                "import_dto:costcenter" => "0    2 * * *",

                // previous base data imports
                "import:machinegroup" => "0    2 * * *",
                "import_dto:machinegroup" => "0    2 * * *",
                "import:hall" => "0    2 * * *",
                "import_dto:hall" => "0    2 * * *",
                "import:resourcegroup                                                                                                                                                                         " => "0    2 * * *",
                "import_dto:resourcegroup" => "0    2 * * *",
                "import_dto:machine" => "0    2 * * *",
                "import:itemgroups" => "0    2 * * *",
                "import_dto:itemgroups" => "0    2 * * *",
                "import_dto:item" => "0    2 * * *",
                "import:classification" => "0    2 * * *",
                "import_dto:classification" => "0    2 * * *",
                "import:bom" => "0    2 * * *",
                "import_dto:bom" => "0    2 * * *",
                "import:item_states" => "0    2 * * *",
                "import_dto:item_states" => "0    2 * * *",
                "import:machine_state_groups" => "0    2 * * *",
                "import_dto:machine_state_groups" => "0    2 * * *",
                "import:machine_states" => "0    2 * * *",
                "import_dto:machine_states" => "0    2 * * *",
                "import_dto:department" => "0    2 * * *",
                "import:tool" => "0    2 * * *",
                "import_dto:tool" => "0    2 * * *",
                "import:operationplan" => "0    2 * * *",
                "import_dto:operationplan" => "0    2 * * *",
                "import:warehouse" => "0    2 * * *",
                "import_dto:warehouse" => "0    2 * * *",
                "import_dto:storage_bin" => "0    2 * * *",
                "bom:flatten" => "0    2 * * *",
                "import_dto:shift" => "0    2 * * *",
                "import_dto:shiftmodel" => "0    2 * * *",
                "import_dto:capacity" => "0    2 * * *",
                "import:customer" => "0    2 * * *",
                "import_dto:customer" => "0    2 * * *",
                "import:supplier" => "0    2 * * *",
                "import_dto:supplier" => "0    2 * * *",
                "import:castvisupermission" => "0    2 * * *",

                "import:salesorder" => "*    * * * *",
                "import_dto:salesorder" => "*    * * * *",
                "import:prodorder" => "*    * * * *",
                "import_dto:prodorder" => "*    * * * *",
                "import:calloff" => "0    * * * *",
                "import:stock" => "0    * * * *",
                "import_dto:stock" => "0    * * * *",
                "read:energy_meters" => "*    * * * *",
                "read:energy_consumption" => "0    * * * *",
                "sanctum:prune-expired --hours=1" => "0    0 * * *",
                "fcm_tokens:cleanup_stale" => "0    0 * * 0",
                "filter:unsaved-entries" => "0    2 * * *",
                "export:data" => "*    * * * *",
                "import:opportunity" => "*/15 * * * *",
                "import:machine_user_times" => "*    * * * *",
                "app:hwe-qs-certificate-pdf-delete" => "0    3 * * *",
                "data-imports:delete-imported" => "0    2 * * *",
                "data-exports:delete-exported" => "0    2 * * *",
                "machine-output:calculate" => "0    2 * * *",
            ],
            "ict" => [
                "import:costcenter" => "0    2 * * *",
                "import_dto:costcenter" => "0    2 * * *",

                // previous base data imports
                "import:machinegroup" => "0    2 * * *",
                "import_dto:machinegroup" => "0    2 * * *",
                "import:hall" => "0    2 * * *",
                "import_dto:hall" => "0    2 * * *",
                "import:resourcegroup                                                                                                                                                                         " => "0    2 * * *",
                "import_dto:resourcegroup" => "0    2 * * *",
                "import_dto:machine" => "0    2 * * *",
                "import:itemgroups" => "0    2 * * *",
                "import_dto:itemgroups" => "0    2 * * *",
                "import_dto:item" => "0    2 * * *",
                "import:classification" => "0    2 * * *",
                "import_dto:classification" => "0    2 * * *",
                "import:bom" => "0    2 * * *",
                "import_dto:bom" => "0    2 * * *",
                "import:item_states" => "0    2 * * *",
                "import_dto:item_states" => "0    2 * * *",
                "import:machine_state_groups" => "0    2 * * *",
                "import_dto:machine_state_groups" => "0    2 * * *",
                "import:machine_states" => "0    2 * * *",
                "import_dto:machine_states" => "0    2 * * *",
                "import_dto:department" => "0    2 * * *",
                "import:tool" => "0    2 * * *",
                "import_dto:tool" => "0    2 * * *",
                "import:operationplan" => "0    2 * * *",
                "import_dto:operationplan" => "0    2 * * *",
                "import:warehouse" => "0    2 * * *",
                "import_dto:warehouse" => "0    2 * * *",
                "import_dto:storage_bin" => "0    2 * * *",
                "bom:flatten" => "0    2 * * *",
                "import_dto:shift" => "0    2 * * *",
                "import_dto:shiftmodel" => "0    2 * * *",
                "import_dto:capacity" => "0    2 * * *",
                "import:customer" => "0    2 * * *",
                "import_dto:customer" => "0    2 * * *",
                "import:supplier" => "0    2 * * *",
                "import_dto:supplier" => "0    2 * * *",
                "import:castvisupermission" => "0    2 * * *",

                "import:salesorder" => "0    * * * *",
                "import_dto:salesorder" => "0    * * * *",
                "import:prodorder" => "0,30 * * * *",
                "import_dto:prodorder" => "0,30 * * * *",
                "import:user" => "*/5  * * * *",
                "import_dto:user" => "*/5  * * * *",
                "jpi:import_halls" => "0    2 * * *",
                "jpi:import_machines" => "0    2 * * *",
                "jpi:import_tools" => "0    2 * * *",
                "jpi:import_users" => "0    2 * * *",
                "jpi:upload_resource_categories" => "0    2 * * *",
                "jpi:upload_resource_groups" => "0    2 * * *",
                "jpi:upload_resources" => "0    2 * * *",
                "jpi:import_prod_orders" => "*/5  * * * *",
                "jpi:upload_progress_jobs" => "*/5  * * * *",
                "jpi:upload_progress_jobs_prepared" => "*/5  * * * *",
                "jpi:upload_jobs" => "0    2 * * *",
                "jpi:download_jobs" => "*/5  * * * *",
                "jpi:update_mes" => "*/5  * * * *",
                "prodorder:export" => "0,30 * * * *",
                "import_dto:off_day" => "0    2 * * *",
                "import:calloff" => "0    * * * *",
                "import:stock" => "0    * * * *",
                "import_dto:stock" => "0    * * * *",
                "read:energy_meters" => "*    * * * *",
                "read:energy_consumption" => "0    * * * *",
                "sanctum:prune-expired --hours=1" => "0    0 * * *",
                "fcm_tokens:cleanup_stale" => "0    0 * * 0",
                "filter:unsaved-entries" => "0    2 * * *",
                "export:data" => "*    * * * *",
                "import:machine_user_times" => "*    * * * *",
                "app:hwe-qs-certificate-pdf-delete" => "0    3 * * *",
                "data-imports:delete-imported" => "0    2 * * *",
                "data-exports:delete-exported" => "0    2 * * *",
                "machine-output:calculate" => "0    2 * * *",
            ],
            "ict_test" => [
                "import:costcenter" => "0    2 * * *",
                "import_dto:costcenter" => "0    2 * * *",

                // previous base data imports
                "import:machinegroup" => "0    2 * * *",
                "import_dto:machinegroup" => "0    2 * * *",
                "import:hall" => "0    2 * * *",
                "import_dto:hall" => "0    2 * * *",
                "import:resourcegroup                                                                                                                                                                         " => "0    2 * * *",
                "import_dto:resourcegroup" => "0    2 * * *",
                "import_dto:machine" => "0    2 * * *",
                "import:itemgroups" => "0    2 * * *",
                "import_dto:itemgroups" => "0    2 * * *",
                "import_dto:item" => "0    2 * * *",
                "import:classification" => "0    2 * * *",
                "import_dto:classification" => "0    2 * * *",
                "import:bom" => "0    2 * * *",
                "import_dto:bom" => "0    2 * * *",
                "import:item_states" => "0    2 * * *",
                "import_dto:item_states" => "0    2 * * *",
                "import:machine_state_groups" => "0    2 * * *",
                "import_dto:machine_state_groups" => "0    2 * * *",
                "import:machine_states" => "0    2 * * *",
                "import_dto:machine_states" => "0    2 * * *",
                "import_dto:department" => "0    2 * * *",
                "import:tool" => "0    2 * * *",
                "import_dto:tool" => "0    2 * * *",
                "import:operationplan" => "0    2 * * *",
                "import_dto:operationplan" => "0    2 * * *",
                "import:warehouse" => "0    2 * * *",
                "import_dto:warehouse" => "0    2 * * *",
                "import_dto:storage_bin" => "0    2 * * *",
                "bom:flatten" => "0    2 * * *",
                "import_dto:shift" => "0    2 * * *",
                "import_dto:shiftmodel" => "0    2 * * *",
                "import_dto:capacity" => "0    2 * * *",
                "import:customer" => "0    2 * * *",
                "import_dto:customer" => "0    2 * * *",
                "import:supplier" => "0    2 * * *",
                "import_dto:supplier" => "0    2 * * *",
                "import:castvisupermission" => "0    2 * * *",

                "import:salesorder" => "0    * * * *",
                "import_dto:salesorder" => "0    * * * *",
                "import:prodorder" => "0,30 * * * *",
                "import_dto:prodorder" => "0,30 * * * *",
                "import:user" => "*/5  * * * *",
                "import_dto:user" => "*/5  * * * *",
                "jpi:import_halls" => "0    2 * * *",
                "jpi:import_machines" => "0    2 * * *",
                "jpi:import_tools" => "0    2 * * *",
                "jpi:import_users" => "0    2 * * *",
                "jpi:upload_resource_categories" => "0    2 * * *",
                "jpi:upload_resource_groups" => "0    2 * * *",
                "jpi:upload_resources" => "0    2 * * *",
                "jpi:import_prod_orders" => "*/5  * * * *",
                "jpi:upload_progress_jobs" => "*/5  * * * *",
                "jpi:upload_progress_jobs_prepared" => "*/5  * * * *",
                "jpi:upload_jobs" => "0    2 * * *",
                "jpi:download_jobs" => "*/5  * * * *",
                "jpi:update_mes" => "*/5  * * * *",
                "prodorder:export" => "0,30 * * * *",
                "import_dto:off_day" => "0    2 * * *",
                "import:calloff" => "0    * * * *",
                "import:stock" => "0    * * * *",
                "import_dto:stock" => "0    * * * *",
                "read:energy_meters" => "*    * * * *",
                "read:energy_consumption" => "0    * * * *",
                "sanctum:prune-expired --hours=1" => "0    0 * * *",
                "fcm_tokens:cleanup_stale" => "0    0 * * 0",
                "filter:unsaved-entries" => "0    2 * * *",
                "export:data" => "*    * * * *",
                "import:machine_user_times" => "*    * * * *",
                "app:hwe-qs-certificate-pdf-delete" => "0    3 * * *",
                "data-imports:delete-imported" => "0    2 * * *",
                "data-exports:delete-exported" => "0    2 * * *",
                "machine-output:calculate" => "0    2 * * *",
            ],

            "default" => [
                "import:costcenter" => "0    2 * * *",
                "import_dto:costcenter" => "0    2 * * *",

                // previous base data imports
                "import:machinegroup" => "0    2 * * *",
                "import_dto:machinegroup" => "0    2 * * *",
                "import:hall" => "0    2 * * *",
                "import_dto:hall" => "0    2 * * *",
                "import:resourcegroup                                                                                                                                                                         " => "0    2 * * *",
                "import_dto:resourcegroup" => "0    2 * * *",
                "import_dto:machine" => "0    2 * * *",
                "import:itemgroups" => "0    2 * * *",
                "import_dto:itemgroups" => "0    2 * * *",
                "import_dto:item" => "0    2 * * *",
                "import:classification" => "0    2 * * *",
                "import_dto:classification" => "0    2 * * *",
                "import:bom" => "0    2 * * *",
                "import_dto:bom" => "0    2 * * *",
                "import:item_states" => "0    2 * * *",
                "import_dto:item_states" => "0    2 * * *",
                "import:machine_state_groups" => "0    2 * * *",
                "import_dto:machine_state_groups" => "0    2 * * *",
                "import:machine_states" => "0    2 * * *",
                "import_dto:machine_states" => "0    2 * * *",
                "import_dto:department" => "0    2 * * *",
                "import:tool" => "0    2 * * *",
                "import_dto:tool" => "0    2 * * *",
                "import:operationplan" => "0    2 * * *",
                "import_dto:operationplan" => "0    2 * * *",
                "import:warehouse" => "0    2 * * *",
                "import_dto:warehouse" => "0    2 * * *",
                "import_dto:storage_bin" => "0    2 * * *",
                "bom:flatten" => "0    2 * * *",
                "import_dto:shift" => "0    2 * * *",
                "import_dto:shiftmodel" => "0    2 * * *",
                "import_dto:capacity" => "0    2 * * *",
                "import:customer" => "0    2 * * *",
                "import_dto:customer" => "0    2 * * *",
                "import:supplier" => "0    2 * * *",
                "import_dto:supplier" => "0    2 * * *",
                "import:castvisupermission" => "0    2 * * *",

                "import:salesorder" => "0    * * * *",
                "import_dto:salesorder" => "0    * * * *",
                "import:prodorder" => "0,30 * * * *",
                "import_dto:prodorder" => "0,30 * * * *",
                "import:calloff" => "0    * * * *",
                "import:stock" => "0    * * * *",
                "import_dto:stock" => "0    * * * *",
                "read:energy_meters" => "*    * * * *",
                "read:energy_consumption" => "0    * * * *",
                "sanctum:prune-expired --hours=1" => "0    0 * * *",
                "fcm_tokens:cleanup_stale" => "0    0 * * 0",
                "filter:unsaved-entries" => "0    2 * * *",
                "export:data" => "*    * * * *",
                "import:machine_user_times" => "*    * * * *",
                "app:hwe-qs-certificate-pdf-delete" => "0    3 * * *",
                "data-imports:delete-imported" => "0    2 * * *",
                "data-exports:delete-exported" => "0    2 * * *",
                "machine-output:calculate" => "0    2 * * *",
                "crm:kanban-current-date" => "0    2 * * *",
            ]
        ];

        $priority = CommandSchedule::query()->max('priority') ?? 0;

        $previousConfigValues = $previousConfig[env('EXTERNAL_DS_TARGET')] ?? $previousConfig['default'];

        foreach ($previousConfigValues as $commandString => $cron) {
            $command = CommandSchedule::query()->where('command', $commandString)->first();
            if (!$command) {
                $priority += 100;

                $command = new CommandSchedule();
                $command->command = $commandString;
                $command->cron_expression = $cron;
                $command->priority = $priority;
                $command->is_active = true;
                $command->save();
            }
        }

        foreach ($imports as $import) {
            $importCmdInstance = app($import);
            $importCmd = $importCmdInstance->getName();
            $command = CommandSchedule::query()->where('command', $importCmd)->first();
            if (!$command) {
                $priority += 100;

                $command = new CommandSchedule();
                $command->command = $importCmd;
                $command->cron_expression = '* * * * *';
                $command->priority = $priority;
                $command->is_active = false;
                $command->save();
            }
        }
    }
}
