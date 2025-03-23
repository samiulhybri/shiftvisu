<?php

namespace App\ExternalDataSource\Dto;

class StorageTypeDto
{
    public string $custom_id;
    public bool $is_active;

    public function __construct(
        string $custom_id,
        bool   $is_active = true,
    )
    {
        $this->custom_id = $custom_id;
        $this->is_active = $is_active;
    }
}