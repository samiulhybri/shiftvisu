<?php

namespace Database\Seeders;

use App\Models\IdGeneratorSetting;
use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
use Illuminate\Database\Seeder;

class HweKalkIdGeneratorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $data = [
            [
                "entity" => "Offer",
                "table" => "offers",
                "prefix" => "OF-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Material",
                "table" => "materials",
                "prefix" => "MAT-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Norm",
                "table" => "norms",
                "prefix" => "NOR-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Specification",
                "table" => "specifications",
                "prefix" => "CS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MtSpec",
                "table" => "mt_specs",
                "prefix" => "MTS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "ResidualMaterial",
                "table" => "residual_materials",
                "prefix" => "RM-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Documentation",
                "table" => "documentations",
                "prefix" => "DOC-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "UsNorm",
                "table" => "us_norms",
                "prefix" => "USN-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MtNorm",
                "table" => "mt_norms",
                "prefix" => "MTN-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "VtNorm",
                "table" => "vt_norms",
                "prefix" => "VTN-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "PtNorm",
                "table" => "pt_norms",
                "prefix" => "PTN-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "TestingScope",
                "table" => "testing_scopes",
                "prefix" => "TS-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "NonDestructiveTesting",
                "table" => "non_destructive_testings",
                "prefix" => "NDT-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Metallography",
                "table" => "metallographies",
                "prefix" => "MG-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MaterialDatabase",
                "table" => "material_databases",
                "prefix" => "MD-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "Specification",
                "table" => "specifications",
                "prefix" => "SP-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "OperationPlan",
                "table" => "operation_plans",
                "prefix" => "OP-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "HweqsSamples",
                "table" => "hwe_qs_samples",
                "prefix" => "SN-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "HardenabilityRange",
                "table" => "hardenability_ranges",
                "prefix" => "HR-",
                "field" => "custom_id",
                "length" => 8
            ],
            [
                "entity" => "MaterialAnalysis",
                "table" => "material_analyses",
                "prefix" => "MA-",
                "field" => "custom_id",
                "length" =>8
            ],
            [
                "entity" => "Deformation",
                "table" => "deformations",
                "prefix" => "DE-",
                "field" => "custom_id",
                "length" =>8
            ],
            [
                "entity" => "HweWorkPlan",
                "table" => "hwe_work_plans",
                "prefix" => "HWP-",
                "field" => "custom_id",
                "length" =>8
            ],
            [
                "entity" => "HweMeltAnalysis",
                "table" => "hwe_melt_analyses",
                "prefix" => "HWMA-",
                "field" => "custom_id",
                "length" =>9
            ]
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
