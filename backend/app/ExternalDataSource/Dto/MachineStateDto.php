<?php

namespace App\ExternalDataSource\Dto;

class MachineStateDto
{
    public string $custom_id;
    public string $machine_state_group_id_custom;
    public bool $is_active;
    public string $name;
    public ?string $xml_id;

    public function __construct(
        string  $custom_id,
        string  $machine_state_group_id_custom,
        string  $name,
        bool    $is_active = true,
        ?string $xml_id = null
    )
    {
        $this->custom_id = $custom_id;
        $this->machine_state_group_id_custom = $machine_state_group_id_custom;
        $this->is_active = $is_active;
        $this->name = $name;
        $this->xml_id = $xml_id;
    }
}
