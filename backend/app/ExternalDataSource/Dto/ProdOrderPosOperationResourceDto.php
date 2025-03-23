<?php

namespace App\ExternalDataSource\Dto;

class ProdOrderPosOperationResourceDto
{
    public string $pos;
    public bool $is_active;
    public ?string $item_id_tool_custom;
    public ?string $equipment_id_custom;
    public ?int $reference_nr;

    public function __construct(
        string  $pos,
        bool    $is_active = true,
        ?string  $item_id_tool_custom = null,
        ?string  $equipment_id_custom = null,
        int  $reference_nr = null
    )
    {
        $this->pos = $pos;
        $this->is_active = $is_active;
        $this->item_id_tool_custom = $item_id_tool_custom;
        $this->equipment_id_custom = $equipment_id_custom;
        $this->reference_nr = $reference_nr;
    }
}