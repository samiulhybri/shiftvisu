<?php

namespace App\ExternalDataSource\Dto;

class UserGroupDto
{
    public string $custom_id;
    public ?string $name;
    public ?bool $is_active;
    public ?string $hall_id_custom;
    public ?bool $is_imported_from_erp;

    public function __construct(
        string $custom_id,
        ?string $name = null,
        ?bool $is_active = true,
        ?string $hall_id_custom = null,
        ?bool $is_imported_from_erp = true
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->hall_id_custom = $hall_id_custom;
        $this->is_imported_from_erp = $is_imported_from_erp;
    }
}