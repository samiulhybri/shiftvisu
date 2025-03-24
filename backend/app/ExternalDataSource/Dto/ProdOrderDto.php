<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ProdOrderType;

class ProdOrderDto
{
    public string $custom_id;
    public ?string $assembly;
    public ?string $document_date;
    public ?string $production_register;

    /**
     * @var ProdOrderPosDto[]
     */
    public array $positions;
    public ?string $xml_id;
    public ProdOrderType $order_type;
    public ?string $plant_id_production_custom;
    public ?string $plant_id_custom;
    public bool $update_only;
    public bool $is_closed;

    /**
     * @var ClassificationDto[]
     */
    public array $classifications;

    public function __construct(
        string         $custom_id,
        ?string        $assembly = null,
        ?string        $document_date = null,
        ?string        $production_register = null,
        array          $positions = [],
        ?string        $xml_id = null,
        ?ProdOrderType $order_type = null,
        ?string        $plant_id_production_custom = null,
        ?string        $plant_id_custom = null,
        bool           $update_only = false,
        array          $classifications = [],
        bool           $is_closed = false,
    )
    {
        $this->custom_id = $custom_id;
        $this->assembly = $assembly;
        $this->document_date = $document_date;
        $this->production_register = $production_register;
        $this->positions = $positions;
        $this->xml_id = $xml_id;
        $this->order_type = $order_type ?? ProdOrderType::PRODUCTION();
        $this->plant_id_production_custom = $plant_id_production_custom;
        $this->plant_id_custom = $plant_id_custom;
        $this->update_only = $update_only;
        $this->classifications = $classifications;
        $this->is_closed = $is_closed;
    }
}