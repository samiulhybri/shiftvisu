<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ProdOrderType;
use stdClass;

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


    public static function fromStdClass(stdClass $obj): ProdOrderDto {
        $positions = collect($obj->positions ?? [])->map(function ($position) {
            return ProdOrderPosDto::fromStdClass($position);
        });
        $classifications = collect($obj->classifications ?? [])->map(function ($classification) {
            return ClassificationDto::fromStdClass($classification);
        });

        return new self(
            $obj->custom_id,
            $obj->assembly ?? null,
            $obj->document_date ?? null,
            $obj->production_register ?? null,
            $positions->toArray(),
            $obj->xml_id ?? null,
            $obj->order_type ?? ProdOrderType::PRODUCTION(),
            $obj->plant_id_production_custom ?? null,
            $obj->plant_id_custom ?? null,
            $obj->update_only ?? false,
            $classifications->toArray(),
            $obj->is_closed ?? false
        );
    }
}