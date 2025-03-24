<?php

namespace App\ExternalDataSource\Dto;

class MachineGroupDto
{
    public string $custom_id;
    public string $name;
    public float $lead_time_days;
    public ?float $machine_price;
    public ?string $cost_center_id_custom;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        string $name,
        float $lead_time_days = 0,
        float $machine_price = null,
        string $cost_center_id_custom = null,
        string $xml_id = null,
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->lead_time_days = $lead_time_days;
        $this->machine_price = $machine_price;
        $this->cost_center_id_custom = $cost_center_id_custom;
        $this->xml_id = $xml_id;
    }
}
