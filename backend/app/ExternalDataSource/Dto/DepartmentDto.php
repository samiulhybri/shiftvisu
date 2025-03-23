<?php

namespace App\ExternalDataSource\Dto;

class DepartmentDto
{
    public string $custom_id;
    public bool $is_active;
    public string $name;
    public array $hall_ids_custom;

    public function __construct(
        string $custom_id,
        string $name,
        bool   $is_active = true,
        array  $hall_ids_custom = [],
    )
    {
        $this->custom_id = $custom_id;
        $this->is_active = $is_active;
        $this->name = $name;
        $this->hall_ids_custom = $hall_ids_custom;
    }
}
