<?php

namespace App\ExternalDataSource\Dto;


class SupplierDto
{
    public string $custom_id;
    public string $name;
    public bool $is_active;
    public bool $is_imported_from_erp;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true,
        bool $is_imported_from_erp = false,
        ?string $xml_id = null,
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->is_imported_from_erp = $is_imported_from_erp;
        $this->xml_id = $xml_id;
    }
}
