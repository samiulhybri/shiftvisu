<?php

namespace App\ExternalDataSource\Dto;

class ResourceGroupDto
{
    public string $custom_id;
    public string $name;
    public bool $is_active;
    public bool $is_imported_from_erp;
    public ?string $hall_id_custom;
    public ?string $xml_id;
    public float $jpi_factor;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true,
        bool $is_imported_from_erp = true,
        ?string $hall_id_custom = null,
        ?string $xml_id = null,
        float $jpi_factor = 1,
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->is_imported_from_erp = $is_imported_from_erp;
        $this->hall_id_custom = $hall_id_custom;
        $this->xml_id = $xml_id;
        $this->jpi_factor = $jpi_factor;
    }
}