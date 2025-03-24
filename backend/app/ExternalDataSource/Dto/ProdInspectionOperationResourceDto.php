<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ProdInspectionOperationResourceType;

class ProdInspectionOperationResourceDto
{
    public bool $is_active;
    public ?string $pos;
    public ?string $equipment_id_custom;
    public ProdInspectionOperationResourceType $type;
    public ?string $external_id;

    public function __construct(
        bool    $is_active = true,
        ?string $pos = null,
        ?string $equipment_id_custom = null,
        ProdInspectionOperationResourceType $type = ProdInspectionOperationResourceType::EQUIPMENT,
        ?string $external_id = null,
    )
    {
        $this->pos = $pos;
        $this->is_active = $is_active;
        $this->equipment_id_custom = $equipment_id_custom;
        $this->type = $type;
        $this->external_id = $external_id;
    }
}