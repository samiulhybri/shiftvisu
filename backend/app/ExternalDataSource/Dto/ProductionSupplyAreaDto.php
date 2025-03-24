<?php

namespace App\ExternalDataSource\Dto;

class ProductionSupplyAreaDto
{
    public string $custom_id;
    public ?string $plant_id_custom;
    public bool $is_active;

    public function __construct(
        string  $custom_id,
        ?string $plant_id_custom = null,
        bool    $is_active = true,
    )
    {
        $this->custom_id = $custom_id;
        $this->plant_id_custom = $plant_id_custom;
        $this->is_active = $is_active;
    }
}