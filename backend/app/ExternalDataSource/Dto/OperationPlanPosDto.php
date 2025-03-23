<?php

namespace App\ExternalDataSource\Dto;

class OperationPlanPosDto
{
    public string $pos;
    public ?string $name;
    public float $te;
    public float $tr;
    public float $lead_time_days;
    public ?string $machine_id_custom;
    public ?int $cavity;

    public function __construct(
        string $pos,
        string $name = null,
        float $te = 0,
        float $tr = 0,
        string $machine_id_custom = null,
        float $lead_time_days = 0,
        int $cavity = 1
    ) {
        $this->pos = $pos;
        $this->name = $name;
        $this->te = $te;
        $this->tr = $tr;
        $this->machine_id_custom = $machine_id_custom;
        $this->lead_time_days = $lead_time_days;
        $this->cavity = $cavity;
    }
}
