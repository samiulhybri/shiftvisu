<?php

namespace App\ExternalDataSource\Dto;

class HandlingUnitDto
{
    public string $custom_id;
    public string $handling_unit_item_id_custom;
    public ?string $parent_handling_unit_id_custom;
    public bool $is_active;
    public bool $is_complete;
    public ?string $storage_bin_id_custom;
    public ?string $storage_location_id_custom;
    /**
     * @var HandlingUnitItemDto[]
     */
    public array $items;
    public ?string $plant_id_custom;

    public function __construct(
        string  $custom_id,
        string  $handling_unit_item_id_custom,
        bool    $is_active = true,
        bool    $is_complete = false,
        ?string $parent_handling_unit_id_custom = null,
        ?string $storage_bin_id_custom = null,
        ?string $storage_location_id_custom = null,
        array   $items = [],
        ?string $plant_id_custom = null
    )
    {
        $this->custom_id = $custom_id;
        $this->handling_unit_item_id_custom = $handling_unit_item_id_custom;
        $this->is_active = $is_active;
        $this->is_complete = $is_complete;
        $this->parent_handling_unit_id_custom = $parent_handling_unit_id_custom;
        $this->storage_bin_id_custom = $storage_bin_id_custom;
        $this->storage_location_id_custom = $storage_location_id_custom;
        $this->items = $items;
        $this->plant_id_custom = $plant_id_custom;
    }

}