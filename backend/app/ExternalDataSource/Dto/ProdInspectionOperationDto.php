<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ProdInspectionOperationFrequency;

class ProdInspectionOperationDto
{
    public ?string $pos;
    public ?ProdInspectionOperationFrequency $frequency;
    public ?bool $is_active;
    public ?bool $is_blocking;
    public ?string $name;
    public ?string $inspection_lot;
    public ?string $internal_id;
    public ?int $interval_cycles;
    public ?int $interval_seconds;
    public ?string $xml_id;

    /**
     * @var InspectionOperationCharacteristicDto[]
     */
    public array $inspectionOperationCharacteristicDtos;

    /**
     * @var ProdInspectionOperationResourceDto[]
     */
    public array $prodInspectionOperationResourceDtos;

    public function __construct(
        ?string                           $pos = null,
        ?string                           $inspection_lot = null,
        ?string                           $internal_id = null,
        ?ProdInspectionOperationFrequency $frequency = null,
        ?bool                             $is_active = null,
        ?bool                             $is_blocking = null,
        ?string                           $name = null,
        array                             $inspectionOperationCharacteristicDtos = [],
        array                             $prodInspectionOperationResourceDtos = [],
        ?int                              $interval_cycles = null,
        ?int                              $interval_seconds = null,
        ?string                           $xml_id = null,
    )
    {
        $this->pos = $pos;
        $this->frequency = $frequency;
        $this->is_active = $is_active ?? true;
        $this->is_blocking = $is_blocking ?? false;
        $this->name = $name;
        $this->inspection_lot = $inspection_lot;
        $this->internal_id = $internal_id;
        $this->xml_id = $xml_id;
        $this->inspectionOperationCharacteristicDtos = $inspectionOperationCharacteristicDtos;
        $this->prodInspectionOperationResourceDtos = $prodInspectionOperationResourceDtos;
        $this->interval_cycles = $interval_cycles;
        $this->interval_seconds = $interval_seconds;
    }
}