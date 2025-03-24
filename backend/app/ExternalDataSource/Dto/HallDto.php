<?php

namespace App\ExternalDataSource\Dto;

class HallDto
{
    public string $custom_id;
    public string $name;
    public bool $is_active;
    public bool $is_enabled_plan_visu;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true,
        bool $is_enabled_plan_visu = false,
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->is_enabled_plan_visu = $is_enabled_plan_visu;
    }
}
