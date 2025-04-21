<?php

namespace App\ExternalDataSource\Dto;

use stdClass;

class HandlingUnitItemDto
{
    public string $item_id_custom;
    public int $quantity;
    public ?string $batch;
    public ?string $serial_number;
    public ?string $item_state_id_custom;

    public function __construct(
        string  $item_id_custom,
        float   $quantity,
        ?string $batch = null,
        ?string $serial_number = null,
        ?string $item_state_id_custom = null
    )
    {
        $this->item_id_custom = $item_id_custom;
        $this->quantity = $quantity;
        $this->batch = $batch;
        $this->serial_number = $serial_number;
        $this->item_state_id_custom = $item_state_id_custom;
    }


    public static function fromStdClass(stdClass $obj): self {
        return new self(
            $obj->item_id_custom,
            $obj->quantity,
            $obj->batch ?? null,
            $obj->serial_number ?? null,
            $obj->item_state_id_custom ?? null,
        );
    }
}