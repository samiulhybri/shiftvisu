<?php

namespace App\ExternalDataSource\Dto;

class SalesOrderDto
{
    public string $custom_id;
    public string $customer_id_custom;
    public ?string $xml_id;
    public array $classifications;
    public array $sales_order_pos;
    public ?string $customer_reference;

    public function __construct(
        string  $custom_id,
        string  $customer_id_custom,
        ?string $xml_id = null,
        array   $sales_order_pos = [],
        array   $classifications = [],
        ?string $customer_reference = null,
    )
    {
        $this->custom_id = $custom_id;
        $this->customer_id_custom = $customer_id_custom;
        $this->xml_id = $xml_id;
        $this->classifications = $classifications;
        $this->sales_order_pos = $sales_order_pos;
        $this->customer_reference = $customer_reference;
    }
}
