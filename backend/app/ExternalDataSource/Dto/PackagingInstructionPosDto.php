<?php

namespace App\ExternalDataSource\Dto;

use stdClass;

class PackagingInstructionPosDto
{
    public string $pos;
    public bool $is_container;
    public ?string $packed_item_id_custom;
    public ?string $subordinate_packaging_instruction_uuid;
    public float $target_quantity;
    public ?string $unit_of_measure_id_custom;
    public bool $is_active;

    public function __construct(
        string  $pos,
        bool    $is_container = false,
        ?string $packed_item_id_custom = null,
        ?string $subordinate_packaging_instruction_uuid = null,
        float   $target_quantity = 0,
        string  $unit_of_measure_id_custom = null,
        bool    $is_active = true,
    )
    {
        $this->pos = $pos;
        $this->is_container = $is_container;
        $this->packed_item_id_custom = $packed_item_id_custom;
        $this->subordinate_packaging_instruction_uuid = $subordinate_packaging_instruction_uuid;
        $this->target_quantity = $target_quantity;
        $this->unit_of_measure_id_custom = $unit_of_measure_id_custom;
        $this->is_active = $is_active;
    }

    public static function fromStdClass(stdClass $obj) : PackagingInstructionPosDto
    {
        return new PackagingInstructionPosDto(
            $obj->pos,
            $obj->is_container = false,
            $obj->packed_item_id_custom = null,
            $obj->subordinate_packaging_instruction_uuid = null,
            $obj->target_quantity = 0,
            $obj->unit_of_measure_id_custom = null,
            $obj->is_active = true,
        );
    }
}