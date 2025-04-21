<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ComponentPreparationState;
use stdClass;

class ProdOrderPosBomPosDto
{
    public int $pos;
    public ?string $item_id_custom;
    public float $qty_for_one_parent;
    public float $quantity_total;
    public ?string $unit_of_measure_id_custom;
    public ?string $name;
    public bool $is_active;
    public bool $is_backflush;
    public bool $is_quantity_fixed;
    public ?string $storage_location_id_custom;
    public ?string $batch;
    public ?string $prod_order_pos_operation_pos;
    public array $classifications;
    public ?bool $is_bulk;
    public ?string $item_type;
    public ?string $reference_document;
    public ?string $storage_bin_id_custom;
    public ?string $item_number;
    public ?string $warehouse_id_custom;
    public ?string $warehouse_process_type;
    public ?string $stock_type;
    public ?string $entitled_to_dispose_party;
    public ?string $stock_owner;
    public ?ComponentPreparationState $component_preparation_state;

    public function __construct(
        int                        $pos,
        ?string                    $item_id_custom = null,
        float                      $qty_for_one_parent = 0,
        float                      $quantity_total = 0,
        ?string                    $unit_of_measure_id_custom = null,
        ?string                    $name = null,
        bool                       $is_active = true,
        bool                       $is_backflush = true,
        bool                       $is_quantity_fixed = false,
        ?string                    $storage_location_id_custom = null,
        ?string                    $batch = null,
        ?string                    $prod_order_pos_operation_pos = null,
        array                      $classifications = [],
        ?bool                      $is_bulk = false,
        ?string                    $item_type = null,
        ?string                    $reference_document = null,
        ?string                    $storage_bin_id_custom = null,
        ?string                    $item_number = null,
        ?string                    $warehouse_id_custom = null,
        ?string                    $warehouse_process_type = null,
        ?string                    $stock_type = null,
        ?string                    $entitled_to_dispose_party = null,
        ?string                    $stock_owner = null,
        ?ComponentPreparationState $component_preparation_state = null,
    )
    {
        $this->pos = $pos;
        $this->item_id_custom = $item_id_custom;
        $this->qty_for_one_parent = $qty_for_one_parent;
        $this->unit_of_measure_id_custom = $unit_of_measure_id_custom;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->storage_location_id_custom = $storage_location_id_custom;
        $this->batch = $batch;
        $this->prod_order_pos_operation_pos = $prod_order_pos_operation_pos;
        $this->quantity_total = $quantity_total;
        $this->is_backflush = $is_backflush;
        $this->is_quantity_fixed = $is_quantity_fixed;
        $this->classifications = $classifications;
        $this->is_bulk = $is_bulk;
        $this->item_type = $item_type;
        $this->reference_document = $reference_document;
        $this->storage_bin_id_custom = $storage_bin_id_custom;
        $this->item_number = $item_number;
        $this->warehouse_id_custom = $warehouse_id_custom;
        $this->warehouse_process_type = $warehouse_process_type;
        $this->stock_type = $stock_type;
        $this->entitled_to_dispose_party = $entitled_to_dispose_party;
        $this->stock_owner = $stock_owner;
        $this->component_preparation_state = $component_preparation_state;
    }

    public static function fromStdClass(stdClass $obj): ProdOrderPosBomPosDto
    {
        $classifications = collect($obj->classifications ?? [])->map(function ($classification) {
            return ClassificationDto::fromStdClass($classification);
        });

        return new self(
            $obj->pos,
            $obj->item_id_custom ?? null,
            $obj->qty_for_one_parent ?? 0,
            $obj->quantity_total ?? 0,
            $obj->unit_of_measure_id_custom ?? null,
            $obj->name ?? null,
            $obj->is_active ?? true,
            $obj->is_backflush ?? true,
            $obj->is_quantity_fixed ?? false,
            $obj->storage_location_id_custom ?? null,
            $obj->batch ?? null,
            $obj->prod_order_pos_operation_pos ?? null,
            $classifications->toArray(),
            $obj->is_bulk ?? false,
            $obj->item_type ?? null,
            $obj->reference_document ?? null,
            $obj->storage_bin_id_custom ?? null,
            $obj->item_number ?? null,
            $obj->warehouse_id_custom ?? null,
            $obj->warehouse_process_type ?? null,
            $obj->stock_type ?? null,
            $obj->entitled_to_dispose_party ?? null,
            $obj->stock_owner ?? null,
            ComponentPreparationState::tryFrom($obj->component_preparation_state) ?? null,
        );
    }
}