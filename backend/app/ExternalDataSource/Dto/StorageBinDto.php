<?php

namespace App\ExternalDataSource\Dto;

class StorageBinDto
{
    public string $custom_id;
    public bool $is_active;
    public ?string $storage_type_id_custom;

    public function __construct(
        string $custom_id,
        bool   $is_active = true,
        ?string   $storage_type_id_custom = null,
    )
    {
        $this->custom_id = $custom_id;
        $this->is_active = $is_active;
        $this->storage_type_id_custom = $storage_type_id_custom;
    }
}