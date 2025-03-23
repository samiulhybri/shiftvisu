<?php

namespace App\ExternalDataSource\Dto;

class EquipmentDto
{
    public string $custom_id;
    public ?string $item_id_custom;
    public ?string $name;
    public ?string $serial;
    public bool $is_transport_possible;
    public ?string $validity_end;

    public function __construct(
        string $custom_id,
        ?string $item_id_custom = null,
        ?string $name = null,
        ?string $serial = null,
        ?string $validity_end = null,
        bool $is_transport_possible = true,
    )
    {
        $this->custom_id = $custom_id;
        $this->item_id_custom = $item_id_custom;
        $this->name = $name;
        $this->serial = $serial;
        $this->validity_end = $validity_end;
        $this->is_transport_possible = $is_transport_possible;
    }
}