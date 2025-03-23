<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExternalDataSourceController;
use App\Models\AttributeSet;
use App\Models\DataImport;
use App\Models\InspectionOperationCharacteristic;
use App\Models\InspectionOperationCharacteristicOption;
use App\Models\InspectionSpecificationImportanceCode;
use App\Models\ProdInspectionOperation;
use App\Models\ProdOrderPos;
use App\Models\UnitOfMeasure;
use App\Models\UserGroup;
use Illuminate\Console\Command;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Support\Collection;

class ProdInspectionOperationDtoImport extends Command
{
    use DispatchesJobs;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import_dto:prod_inspection_operations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $ds = new ExternalDataSourceController();
        $skip = 0;
        $take = env('DATA_CHUNK_SIZE');
        $xmlIds = [];

        $unitOfMeasures = collect();
        foreach (UnitOfMeasure::all() as $unitOfMeasure) {
            $unitOfMeasures[$unitOfMeasure->custom_id] = $unitOfMeasure->id;
        }

        $userGroups = collect();
        foreach (UserGroup::all() as $userGroup) {
            $userGroups[$userGroup->custom_id] = $userGroup->id;
        }

        $importanceCodes = collect();
        foreach (InspectionSpecificationImportanceCode::all() as $importanceCode) {
            $importanceCodes[$importanceCode->custom_id] = $importanceCode->id;
        }

        $attributeSets = AttributeSet::with('attributeSetOptions')
            ->get()
            ->mapWithKeys(function ($attributeSet) {
                return ["" . $attributeSet->plant->custom_id . "_" . $attributeSet->custom_id => $attributeSet];
            });

        // Process inspection lots in chunks
        while ($chunk = $ds->prodInspectionOperationDtos($skip, $take)) {
            $skip += $take;

            foreach ($chunk as $inspectionOperationDto) {
                // Add unique xml_id to $xmlIds
                if (isset($inspectionOperationDto->xml_id) && !in_array($inspectionOperationDto->xml_id, $xmlIds)) {
                    $xmlIds[] = $inspectionOperationDto->xml_id;
                }

                $results = ProdInspectionOperation::query()
                    ->join('prod_order_pos_operations', 'prod_inspection_operations.prod_order_pos_operation_id', '=', 'prod_order_pos_operations.id')
                    ->join('inspection_lots', function ($join) {
                        $join->on('inspection_lots.inspectable_id', '=', 'prod_order_pos_operations.prod_order_pos_id')
                            ->where('inspection_lots.inspectable_type', ProdOrderPos::class);
                    })
                    ->where('inspection_lots.custom_id', $inspectionOperationDto->inspection_lot)
                    ->where('prod_inspection_operations.internal_id', $inspectionOperationDto->internal_id)
                    ->select('prod_inspection_operations.*')
                    ->get();

                foreach ($inspectionOperationDto->inspectionOperationCharacteristicDtos as $inspectionOperationCharacteristicDto) {
                    foreach ($results as $result) {
                        $attributeSet = $attributeSets["" . $inspectionOperationCharacteristicDto->plant_id_custom . "_" . $inspectionOperationCharacteristicDto->attribute_set_id_custom] ?? null;

                        $inspectionOperationCharacteristic = InspectionOperationCharacteristic::query()->updateOrCreate(
                            [
                                "characteristicable_id" => $result->id,
                                "characteristicable_type" => ProdInspectionOperation::class,
                                "pos" => $inspectionOperationCharacteristicDto->pos,
                            ],
                            [
                                "name" => $inspectionOperationCharacteristicDto->name,
                                "is_quantitative" => $inspectionOperationCharacteristicDto->is_quantitative,
                                "value_target" => $inspectionOperationCharacteristicDto->value_target,
                                "value_lower_limit" => $inspectionOperationCharacteristicDto->value_lower_limit,
                                "value_upper_limit" => $inspectionOperationCharacteristicDto->value_upper_limit,
                                "value_lower_limit_plausible" => $inspectionOperationCharacteristicDto->value_lower_limit_plausible,
                                "value_upper_limit_plausible" => $inspectionOperationCharacteristicDto->value_upper_limit_plausible,
                                "is_required" => $inspectionOperationCharacteristicDto->is_required,
                                "is_note_required" => $inspectionOperationCharacteristicDto->is_note_required,
                                "decimals" => $inspectionOperationCharacteristicDto->decimals,
                                "unit_of_measure_id_value" => $this->createUnitIfNotExists($unitOfMeasures, $inspectionOperationCharacteristicDto->unit_of_measure_id_custom_value),
                                "sample_size" => $inspectionOperationCharacteristicDto->sample_size,
                                "unit_of_measure_id_sample" => $this->createUnitIfNotExists($unitOfMeasures, $inspectionOperationCharacteristicDto->unit_of_measure_id_custom_sample),
                                "attribute_set_id" => $attributeSet?->id ?? null,
                                "user_group_id" => $this->createUserGroupIfNotExists($userGroups, $inspectionOperationCharacteristicDto->user_group_id_custom),
                                "inspection_specification_importance_code_id" => $this->createImportanceCodeIfNotExists($importanceCodes, $inspectionOperationCharacteristicDto->importance_code_id_custom),
                            ]
                        );

                        if ($attributeSet) {
                            foreach ($attributeSet->attributeSetOptions as $attributeSetOption) {
                                InspectionOperationCharacteristicOption::query()->updateOrCreate(
                                    [
                                        "inspection_operation_characteristic_id" => $inspectionOperationCharacteristic->id,
                                        "attribute_set_option_id" => $attributeSetOption->id,
                                        "custom_id" => $attributeSetOption->custom_id,
                                    ],
                                    [
                                        "valuation" => $attributeSetOption->valuation,
                                    ]
                                );
                            }
                        }
                    }
                }
            }
        }

        if (count($xmlIds) > 0) {
            DataImport::query()->whereIn('id', $xmlIds)->update(['is_imported' => 1]);
        }

        return $this::SUCCESS;
    }

    private function createUnitIfNotExists(Collection $units, ?string $custom_id): ?int
    {
        if ($custom_id && !isset($units[$custom_id])) {
            $unitOfMeasure = UnitOfMeasure::query()->firstOrCreate(
                ['custom_id' => $custom_id],
                ['name' => $custom_id, 'is_active' => true]
            );

            $units[$custom_id] = $unitOfMeasure->id;
        }
        return $units[$custom_id] ?? null;
    }

    private function createUserGroupIfNotExists(Collection $userGroups, ?string $custom_id): ?int
    {
        if ($custom_id && !isset($userGroups[$custom_id])) {
            $userGroup = UserGroup::query()->firstOrCreate(
                ['custom_id' => $custom_id],
                ['name' => $custom_id, 'is_active' => true]
            );

            $userGroups[$custom_id] = $userGroup->id;
        }
        return $userGroups[$custom_id] ?? null;
    }

    private function createImportanceCodeIfNotExists(Collection $importanceCodes, ?string $custom_id): ?int
    {
        if ($custom_id && !isset($importanceCodes[$custom_id])) {
            $importanceCode = InspectionSpecificationImportanceCode::query()->firstOrCreate(
                ['custom_id' => $custom_id],
                ['name' => $custom_id, 'is_active' => true]
            );

            $importanceCodes[$custom_id] = $importanceCode->id;
        }
        return $importanceCodes[$custom_id] ?? null;
    }
}
