<?php

namespace App\ExternalDataSource\Dto;

class QualificationDto
{
    public bool $is_active;
    public ?string $item_id_custom;
    public ?string $machine_id_custom;
    public ?string $operation_code;
    public ?float $min_qualification_hours;
    public ?float $min_qualification_operations;
    public ?string $xml_id;

    public function __construct(
        bool $is_active = true,
        ?string $item_id_custom = null,
        ?string $machine_id_custom = null,
        ?string $operation_code = null,
        ?float $min_qualification_hours = null,
        ?float $min_qualification_operations = null,
        ?string $xml_id = null)
    {
        $this->is_active = $is_active;
        $this->item_id_custom = $item_id_custom;
        $this->machine_id_custom = $machine_id_custom;
        $this->operation_code = $operation_code;
        $this->min_qualification_hours = $min_qualification_hours;
        $this->min_qualification_operations = $min_qualification_operations;
        $this->xml_id = $xml_id;
    }
}