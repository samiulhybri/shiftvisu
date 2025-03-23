<?php

namespace App\ExternalDataSource\Dto;

class PlantDto
{
    public string $custom_id;
    public bool $is_active;
    public string $name;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
    }
}