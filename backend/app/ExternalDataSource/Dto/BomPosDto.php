<?php

namespace App\ExternalDataSource\Dto;

class BomPosDto
{
    public string $pos;
    public ?string $custom_pos;
    public ?string $item_id_custom;
    public float $qty_for_one_parent;
    public bool $is_active;

    public function __construct(
        string  $pos,
        ?string $custom_pos = null,
        ?string $item_id_custom = null,
        float   $qty_for_one_parent = 0,
        bool    $is_active = true
    )
    {
        $this->pos = $pos;
        $this->custom_pos = $custom_pos;
        $this->item_id_custom = $item_id_custom;
        $this->qty_for_one_parent = $qty_for_one_parent;
        $this->is_active = $is_active;
    }
}