<?php

namespace App\ExternalDataSource\Dto;

class InspectionLotDto
{
    public string $custom_id;
    public ?string $prod_order_id_custom;
    public ?string $item_id_custom;
    public ?string $plant_id_custom;
    public ?string $xml_id;

    public function __construct(
        string  $custom_id,
        ?string $prod_order_id_custom,
        ?string $item_id_custom,
        ?string $plant_id_custom,
        ?string $xml_id = null,
    )
    {
        $this->custom_id = $custom_id;
        $this->prod_order_id_custom = $prod_order_id_custom;
        $this->item_id_custom = $item_id_custom;
        $this->plant_id_custom = $plant_id_custom;
        $this->xml_id = $xml_id;
    }
}