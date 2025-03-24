<?php

namespace App\ExternalDataSource\Dto;

use App\Models\AttributeSetOption;
use App\Models\Plant;

class AttributeSetDto
{
    public string $custom_id;
    public ?string $internal_id;
    public string $plant_id_custom;

    /**
     * @var AttributeSetOptionDto[]
     */
    public array $attributeSetOptions;
    public ?string $xml_id;

    public function __construct(
        string  $custom_id,
        ?string  $internal_id,
        ?string $plant_id_custom = null,
        array $attributeSetOptions = [],
        ?string $xml_id = null,
    )
    {
        $this->custom_id = $custom_id;
        $this->internal_id = $internal_id;
        $this->plant_id_custom = $plant_id_custom ?? Plant::query()->first()->custom_id;
        $this->attributeSetOptions = $attributeSetOptions;
        $this->xml_id = $xml_id;
    }
}