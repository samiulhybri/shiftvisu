<?php

namespace App\DTO;

use App\Models\ProdOrderPosOperationConsumption;

class ConsumptionData
{
    public function __construct(
        public float $quantity,
        public ?string $serial = null,
        public ?string $batch = null,
        public ?int $unit_of_measure_id = null,
        public ?int $storage_location_id = null,
        public ?int $handling_unit_id = null,
        public ?int $item_state_id = null,
        public ?int $item_plant_id = null,
        public ?int $warehouse_id = null,
        public ?int $storage_bin_id = null,
        public ?int $production_supply_area_id = null
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['quantity'],
            $data['serial'] ?? null,
            $data['batch'] ?? null,
            $data['unit_of_measure_id'] ?? null,
            $data['storage_location_id'] ?? null,
            $data['handling_unit_id'] ?? null,
            $data['item_state_id'] ?? null,
            $data['item_plant_id'] ?? null,
            $data['warehouse_id'] ?? null,
            $data['storage_bin_id'] ?? null,
            $data['production_supply_area_id'] ?? null
        );
    }

    public static function fromProdOrderPosOperationConsumption(ProdOrderPosOperationConsumption $consumption): self
    {
        return new self(
            $consumption->quantity,
            $consumption->serial,
            $consumption->batch,
            $consumption->unit_of_measure_id,
            $consumption->storage_location_id,
            $consumption->handling_unit_id,
            $consumption->item_state_id,
            $consumption->item_plant_id,
            $consumption->warehouse_id,
            $consumption->storage_bin_id,
            $consumption->production_supply_area_id
        );
    }

    public function replicate(): self
    {
        return new self(
            $this->quantity,
            $this->serial,
            $this->batch,
            $this->unit_of_measure_id,
            $this->storage_location_id,
            $this->handling_unit_id,
            $this->item_state_id,
            $this->item_plant_id,
            $this->warehouse_id,
            $this->storage_bin_id,
            $this->production_supply_area_id
        );
    }
}
