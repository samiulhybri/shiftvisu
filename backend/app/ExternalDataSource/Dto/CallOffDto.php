<?php

namespace App\ExternalDataSource\Dto;

class CallOffDto
{
    public string $custom_id;
    public string $item_id_custom;
    public string $date;
    public float $quantity;
    public ?bool $is_internal;

    public function __construct(
        string $custom_id,
        string $item_id_custom = null,
        string $date = null,
        float $quantity = 0,
        ?bool $is_internal = false,
    )
    {
        $this->custom_id = $custom_id;
        $this->item_id_custom = $item_id_custom;
        $this->date = $date;
        $this->quantity = $quantity;
        $this->is_internal = $is_internal;
    }
}