<?php

namespace App\ExternalDataSource\Dto;

class SalesOrderPosDto
{
    public string $pos;
    public float $quantity;
    public ?string $customer_reference;
    public ?string $customer_material_number;
    public ?string $delivery_date;
    public ?string $name;
    public array $classifications;

    public function __construct(
        string  $pos,
        float   $quantity,
        ?string $customer_reference = null,
        ?string $customer_material_number = null,
        ?string $delivery_date = null,
        ?string $name = null,
        array   $classifications = [],
    )
    {
        $this->pos = $pos;
        $this->quantity = $quantity;
        $this->customer_reference = $customer_reference;
        $this->customer_material_number = $customer_material_number;
        $this->delivery_date = $delivery_date;
        $this->name = $name;
        $this->classifications = $classifications;
    }
}