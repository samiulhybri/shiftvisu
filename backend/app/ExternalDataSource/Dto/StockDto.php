<?php

namespace App\ExternalDataSource\Dto;

use stdClass;

class StockDto
{
    public ?string $item_id_custom;
    public ?string $plant_id_custom;
    public ?string $storage_location_id_custom;
    public float $quantity;
    public ?string $item_state_id_custom;
    public ?string $batch;
    public ?string $serial;

    public function __construct(
        ?string $item_id_custom,
        ?string $plant_id_custom,
        string  $storage_location_id_custom,
        float   $quantity,
        ?string $item_state_id_custom = null,
        ?string $batch = null,
        ?string $serial = null,
    )
    {
        $this->item_id_custom = $item_id_custom;
        $this->plant_id_custom = $plant_id_custom;
        $this->storage_location_id_custom = $storage_location_id_custom;
        $this->quantity = $quantity;
        $this->item_state_id_custom = $item_state_id_custom;
        $this->batch = $batch;
        $this->serial = $serial;
    }

    public static function fromStdClass(stdClass $obj): self {
        return new self(
            $obj->item_id_custom,
            $obj->plant_id_custom,
            $obj->storage_location_id_custom,
            $obj->quantity,
            $obj->item_state_id_custom ?? null,
            $obj->batch ?? null,
            $obj->serial ?? null,
        );
    }
}