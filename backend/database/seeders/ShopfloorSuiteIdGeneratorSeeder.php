<?php

namespace Database\Seeders;

use App\Models\IdGeneratorSetting;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ShopfloorSuiteIdGeneratorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data = [
            [
                "entity" => "Machine",
                "table" => "machines",
                "prefix" => "MA-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Hall",
                "table" => "halls",
                "prefix" => "HA-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MachineGroup",
                "table" => "machine_groups",
                "prefix" => "MG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ProdLot",
                "table" => "prod_lots",
                "prefix" => "PL-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Tool",
                "table" => "tools",
                "prefix" => "TO-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Item",
                "table" => "items",
                "prefix" => "IT-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Supplier",
                "table" => "suppliers",
                "prefix" => "SU-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Customer",
                "table" => "customers",
                "prefix" => "CU-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "CustomerGroup",
                "table" => "customer_groups",
                "prefix" => "CG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "EnergyConsumer",
                "table" => "energy_consumers",
                "prefix" => "EU-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Crucibles",
                "table" => "crucibles",
                "prefix" => "CR-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "EnergyGateway",
                "table" => "energy_gateways",
                "prefix" => "EG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "User",
                "table" => "users",
                "prefix" => "U-",
                "field" => "custom_id",
                "length" => 8

            ],
            [
                "entity" => "UserGroup",
                "table" => "user_groups",
                "prefix" => "UG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ItemGroup",
                "table" => "item_groups",
                "prefix" => "IG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ItemStates",
                "table" => "item_states",
                "prefix" => "IS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MachineStateGroup",
                "table" => "machine_state_groups",
                "prefix" => "MSG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MachineState",
                "table" => "machine_states",
                "prefix" => "MS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ShiftModel",
                "table" => "shift_models",
                "prefix" => "SM-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Shift",
                "table" => "shifts",
                "prefix" => "S-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "TPMGroup",
                "table" => "tpm_groups",
                "prefix" => "TG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "TPMSubGroup",
                "table" => "tpm_sub_groups",
                "prefix" => "TSG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "TransportOrder",
                "table" => "transport_orders",
                "prefix" => "T-",
                "field" => "custom_id",
                "length" => 12
            ],
            [
                "entity" => "HandlingUnit",
                "table" => "handling_units",
                "prefix" => "HU-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ProdOrder",
                "table" => "prod_orders",
                "prefix" => "PR-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Plant",
                "table" => "plants",
                "prefix" => "PL-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "StorageLocation",
                "table" => "storage_locations",
                "prefix" => "SL-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Warehouse",
                "table" => "warehouses",
                "prefix" => "WH-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "StorageType",
                "table" => "storage_types",
                "prefix" => "ST-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "StorageSection",
                "table" => "storage_sections",
                "prefix" => "SS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "StorageBin",
                "table" => "storage_bins",
                "prefix" => "SB-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ProductionSupplyArea",
                "table" => "production_supply_areas",
                "prefix" => "PSA-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "StandardValueKey",
                "table" => "standard_value_keys",
                "prefix" => "SVK-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ItemStateGroup",
                "table" => "item_state_groups",
                "prefix" => "ISG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Country",
                "table" => "countries",
                "prefix" => "C-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Language",
                "table" => "languages",
                "prefix" => "L-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "RevenueClassifications",
                "table" => "revenue_classifications",
                "prefix" => "RC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "EmployeeClassification",
                "table" => "employee_classifications",
                "prefix" => "EC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "SalesStatus",
                "table" => "sales_statuses",
                "prefix" => "SA-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MarketSegments",
                "table" => "market_segments",
                "prefix" => "MS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "CrmAction",
                "table" => "crm_actions",
                "prefix" => "CA-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "CustomerCrmActionLog",
                "table" => "customer_crm_action_logs",
                "prefix" => "CCAL-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "EnergyConsumerGroups",
                "table" => "energy_consumer_groups",
                "prefix" => "ECG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "PotentialClassification",
                "table" => "potential_classifications",
                "prefix" => "PC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MachineClassification",
                "table" => "machine_classifications",
                "prefix" => "MC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "TransportOrderType",
                "table" => "transport_order_types",
                "prefix" => "TOR-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "NotificationGroup",
                "table" => "notification_groups",
                "prefix" => "NG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "DocVisuDirectoryStructure",
                "table" => "directory_structures",
                "prefix" => "DST-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "DocumentSection",
                "table" => "document_sections",
                "prefix" => "DSC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "DocVisuFile",
                "table" => "doc_visu_files",
                "prefix" => "DF-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "OperationControlProfile",
                "table" => "operation_control_profiles",
                "prefix" => "OCP-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "SerialNumberProfiles",
                "table" => "serial_number_profiles",
                "prefix" => "SN-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "EnergyMeter",
                "table" => "energy_meters",
                "prefix" => "EM-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ShiftVisuComponent",
                "table" => "shift_visu_components",
                "prefix" => "SVC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Area",
                "table" => "areas",
                "prefix" => "A-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ShiftVisuIssueType",
                "table" => "shift_visu_issue_types",
                "prefix" => "SVIT-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "CustomerCategories",
                "table" => "customer_categories",
                "prefix" => "CC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ColorScheme",
                "table" => "plan_visu_color_schemes",
                "prefix" => "PVCS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ItemType",
                "table" => "item_types",
                "prefix" => "ITP-",
                "field" => "custom_id",
                "length" => 8
            ],
        ];
        foreach ($data as $value) {
            IdGeneratorSetting::firstOrCreate([
                "entity" => $value["entity"]
            ], [
                "table" => $value["table"],
                "prefix" => $value["prefix"],
                "field" => $value["field"],
                "length" => $value["length"]
            ]);
        }
    }
}
