<?php

namespace App\ExternalDataSource\Dto;

use stdClass;

class InspectionOperationCharacteristicDto
{
    public string $pos;
    public ?string $name;
    public bool $is_quantitative;
    public ?float $value_target;
    public ?float $value_lower_limit;
    public ?float $value_upper_limit;
    public ?float $value_lower_limit_plausible;
    public ?float $value_upper_limit_plausible;
    public int $decimals;
    public ?string $unit_of_measure_id_custom_value;
    public float $sample_size;
    public ?string $unit_of_measure_id_custom_sample;
    public ?string $attribute_set_id_custom;
    public ?string $plant_id_custom;
    public ?string $user_group_id_custom;
    public ?string $importance_code_id_custom;
    public bool $is_required;
    public bool $is_note_required;

    public function __construct(
        string  $pos,
        ?string $name = null,
        bool    $is_quantitative = true,
        ?float  $value_target = null,
        ?float  $value_lower_limit = null,
        ?float  $value_upper_limit = null,
        ?float  $value_lower_limit_plausible = null,
        ?float  $value_upper_limit_plausible = null,
        int     $decimals = 1,
        ?string $unit_of_measure_id_custom_value = null,
        int     $sample_size = 1,
        ?string $unit_of_measure_id_custom_sample = null,
        ?string $attribute_set_id_custom = null,
        ?string $plant_id_custom = null,
        ?string $user_group_id_custom = null,
        ?string $importance_code_id_custom = null,
        bool    $is_required = true,
        bool    $is_note_required = false,
    )
    {
        $this->pos = $pos;
        $this->name = $name;
        $this->is_quantitative = $is_quantitative;
        $this->value_target = $value_target;
        $this->value_lower_limit = $value_lower_limit;
        $this->value_upper_limit = $value_upper_limit;
        $this->value_lower_limit_plausible = $value_lower_limit_plausible;
        $this->value_upper_limit_plausible = $value_upper_limit_plausible;
        $this->decimals = $decimals;
        $this->unit_of_measure_id_custom_value = $unit_of_measure_id_custom_value;
        $this->sample_size = $sample_size;
        $this->unit_of_measure_id_custom_sample = $unit_of_measure_id_custom_sample;
        $this->attribute_set_id_custom = $attribute_set_id_custom;
        $this->plant_id_custom = $plant_id_custom;
        $this->user_group_id_custom = $user_group_id_custom;
        $this->importance_code_id_custom = $importance_code_id_custom;
        $this->is_required = $is_required;
        $this->is_note_required = $is_note_required;
    }

    public static function fromStdClass(stdClass $obj): InspectionOperationCharacteristicDto
    {
        return new InspectionOperationCharacteristicDto(
            $obj->pos,
            $obj->name ?? null,
            $obj->is_quantitative ?? true,
            $obj->value_target ?? null,
            $obj->value_lower_limit ?? null,
            $obj->value_upper_limit ?? null,
            $obj->value_lower_limit_plausible ?? null,
            $obj->value_upper_limit_plausible ?? null,
            $obj->decimals ?? 1,
            $obj->unit_of_measure_id_custom_value ?? null,
            $obj->sample_size ?? 1,
            $obj->unit_of_measure_id_custom_sample ?? null,
            $obj->attribute_set_id_custom ?? null,
            $obj->plant_id_custom ?? null,
            $obj->user_group_id_custom ?? null,
            $obj->importance_code_id_custom ?? null,
            $obj->is_required ?? true,
            $obj->is_note_required ?? false
        );
    }
}