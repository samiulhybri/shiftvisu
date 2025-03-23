<?php

namespace App\ExternalDataSource\Dto;

class MachineStateGroupDto
{
    public string $custom_id;
    public string $name;
    public bool $is_active;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true,
        ?string $xml_id = null
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->xml_id = $xml_id;
    }
}
