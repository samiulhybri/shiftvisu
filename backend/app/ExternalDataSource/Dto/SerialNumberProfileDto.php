<?php

namespace App\ExternalDataSource\Dto;

class SerialNumberProfileDto
{
    public string $custom_id;
    public ?bool $check_stock;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        bool $check_stock = false,
        string $xml_id = null,
    ) {
        $this->custom_id = $custom_id;
        $this->check_stock = $check_stock;
        $this->xml_id = $xml_id;
    }
}
