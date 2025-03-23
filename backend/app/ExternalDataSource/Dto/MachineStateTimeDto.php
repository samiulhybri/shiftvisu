<?php

namespace App\ExternalDataSource\Dto;

class MachineStateTimeDto
{
    public string $machine_id_custom;
    public string $machine_state_id_custom;
    public string $start;
    public ?string $end;

    public function __construct(
        string  $machine_id_custom,
        string  $machine_state_id_custom,
        string  $start,
        ?string $end
    )
    {
        $this->machine_id_custom = $machine_id_custom;
        $this->machine_state_id_custom = $machine_state_id_custom;
        $this->start = $start;
        $this->end = $end;
    }
}