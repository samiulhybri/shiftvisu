<?php

namespace App\ExternalDataSource\Dto;

class MachineUserTimeDto
{
    public string $machine_id_custom;
    public string $user_id_custom;
    public string $shift_id_custom;
    public string $start;
    public ?string $end;

    public function __construct(string $machine_id_custom, string $user_id_custom, string $shift_id_custom, string $start, ?string $end)
    {
        $this->machine_id_custom = $machine_id_custom;
        $this->user_id_custom = $user_id_custom;
        $this->shift_id_custom = $shift_id_custom;
        $this->start = $start;
        $this->end = $end;
    }
}