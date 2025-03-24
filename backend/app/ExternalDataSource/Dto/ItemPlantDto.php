<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\SerialNumberProfile;

class ItemPlantDto
{
    public bool $is_batch_managed;
    public string $plant_id_custom;
    public ?string $storage_location_id_custom;
    public ?string $storage_location_id_rework_custom;
    public ?string $storage_location_id_scrap_custom;
    public array $storage_location_ids_custom;
    public ?string $serial_number_profile_id_custom;


    public function __construct(
        string  $plant_id_custom,
        bool    $is_batch_managed = false,
        string  $storage_location_id_custom = null,
        string  $storage_location_id_rework_custom = null,
        string  $storage_location_id_scrap_custom = null,
        array   $storage_location_ids_custom = [],
        ?string $serial_number_profile_id_custom = null,
    )
    {
        $this->is_batch_managed = $is_batch_managed;
        $this->plant_id_custom = $plant_id_custom;
        $this->storage_location_id_custom = $storage_location_id_custom;
        $this->storage_location_id_rework_custom = $storage_location_id_rework_custom;
        $this->storage_location_id_scrap_custom = $storage_location_id_scrap_custom;
        $this->storage_location_ids_custom = $storage_location_ids_custom;
        $this->serial_number_profile_id_custom = $serial_number_profile_id_custom;
    }
}