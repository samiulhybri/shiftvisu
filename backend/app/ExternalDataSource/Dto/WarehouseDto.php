<?php

namespace App\ExternalDataSource\Dto;

class WarehouseDto
{
    public string $custom_id;
    public ?string $name;

    /**
     * @var StorageTypeDto[]
     */
    public array $storage_types;

    public function __construct(
        string  $custom_id,
        ?string $name = null,
        array   $storage_types = []
    )
    {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->storage_types = $storage_types;
    }
}