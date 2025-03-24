<?php

namespace App\DTO;

class QuantityData
{
    public function __construct(
        public int $prod_order_pos_operation_id,
        public ?int $item_state_id,
        public float $quantity,
        public ?array $serials = [],
        public ?string $batch = null,
        public ?bool $check_linked_orders = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['prod_order_pos_operation_id'],
            $data['item_state_id'] ?? null,
            $data['quantity'],
            $data['serials'] ?? [],
            $data['batch'] ?? null,
            $data['check_linked_orders'] ?? null
        );
    }
}