<?php

namespace App\ExternalDataSource\Dto;

class InspectionSpecificationDto
{
    public string $custom_id;
    public ?string $plant_id_custom;
    public ?string $inspection_specification_importance_code_id_custom;
    public ?string $xml_id;

    public function __construct(
        string  $custom_id,
        ?string $plant_id_custom = null,
        ?string $inspection_specification_importance_code_id_custom = null,
        ?string $xml_id = null,
    )
    {
        $this->custom_id = $custom_id;
        $this->plant_id_custom = $plant_id_custom;
        $this->inspection_specification_importance_code_id_custom = $inspection_specification_importance_code_id_custom;
        $this->xml_id = $xml_id;
    }
}