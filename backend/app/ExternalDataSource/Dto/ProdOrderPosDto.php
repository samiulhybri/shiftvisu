<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ProdOrderPosStatus;
use App\Models\ProdOrderPosBomPos;
use App\Models\ProdOrderPosSerial;
use stdClass;

class ProdOrderPosDto
{
    public string $pos;
    public ?string $item_id_custom;

    public ?string $start;
    public ?string $end;
    public ?string $release_date;
    public ?string $raw_material;
    public ProdOrderPosStatus $status;
    public ?string $sales_order_id_custom;
    public ?string $sales_order_pos_custom;
    public float $quantity;
    public ?string $due_date;

    /**
     * @var ProdOrderPosOperationDto[]
     */
    public array $operations;

    /**
     * @var ProdOrderPosBomPosDto[]
     */
    public array $components;

    /**
     * @var string[]
     */
    public array $serials;

    public ?string $storage_location_id_custom;
    public ?string $unit_of_measure_id_custom;
    public ?string $notes;
    /**
     * @var ClassificationDto[]
     */
    public array $classifications;
    public ?string $batch;


    public function __construct(
        string              $pos,
        ?string             $item_id_custom = null,
        ?string             $start = null,
        ?string             $end = null,
        ?string             $release_date = null,
        ?string             $due_date = null,
        ?string             $raw_material = null,
        ?ProdOrderPosStatus $status = null,
        ?string             $sales_order_id_custom = null,
        ?string             $sales_order_pos_custom = null,
        float               $quantity = 0,
        array               $operations = [],
        array               $components = [],
        array               $serials = [],
        ?string             $storage_location_id_custom = null,
        ?string             $unit_of_measure_id_custom = null,
        ?string             $notes = null,
        array               $classifications = [],
        ?string             $batch = null
    )
    {
        $this->pos = $pos;
        $this->item_id_custom = $item_id_custom;
        $this->start = $start;
        $this->end = $end;
        $this->release_date = $release_date;
        $this->due_date = $due_date;
        $this->raw_material = $raw_material;
        $this->status = $status ?? ProdOrderPosStatus::PLANNED();
        $this->sales_order_id_custom = $sales_order_id_custom;
        $this->sales_order_pos_custom = $sales_order_pos_custom;
        $this->quantity = $quantity;
        $this->operations = $operations;
        $this->components = $components;
        $this->serials = $serials;
        $this->storage_location_id_custom = $storage_location_id_custom;
        $this->unit_of_measure_id_custom = $unit_of_measure_id_custom;
        $this->notes = $notes;
        $this->classifications = $classifications;
        $this->batch = $batch;
    }

    public static function fromStdClass(stdClass $obj): ProdOrderPosDto
    {
        $operations = collect($obj->operations ?? [])->map(function ($operation) {
            return ProdOrderPosOperationDto::fromStdClass($operation);
        });
        $components = collect($obj->components ?? [])->map(function ($component) {
            return ProdOrderPosBomPosDto::fromStdClass($component);
        });
        $classifications = collect($obj->classifications ?? [])->map(function ($classification) {
            return ClassificationDto::fromStdClass($classification);
        });

        return new self(
            $obj->pos,
            $obj->item_id_custom ?? null,
            $obj->start ?? null,
            $obj->end ?? null,
            $obj->release_date ?? null,
            $obj->due_date ?? null,
            $obj->raw_material ?? null,
            ProdOrderPosStatus::tryFrom($obj->status) ?? null,
            $obj->sales_order_id_custom ?? null,
            $obj->sales_order_pos_custom ?? null,
            $obj->quantity ?? 0,
            $operations->toArray(),
            $components->toArray(),
            $obj->serials ?? [],
            $obj->storage_location_id_custom ?? null,
            $obj->unit_of_measure_id_custom ?? null,
            $obj->notes ?? null,
            $classifications->toArray(),
            $obj->batch ?? null
        );
    }
}