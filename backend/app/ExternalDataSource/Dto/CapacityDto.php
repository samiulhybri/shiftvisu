<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\DateToConsider;

class CapacityDto
{
    public string $date;
    public ?string $shift_id_custom;
    public ?ShiftDto $shift;
    public string $start_time;
    public string $end_time;
    public DateToConsider $date_to_consider;
    public int $break_minutes;
    public ?string $machine_id_custom;
    public ?string $hall_id_custom;

    public function __construct(
        string          $date,
        ?string         $shift_id_custom = null,
        ?string         $start_time = null,
        ?string         $end_time = null,
        ?DateToConsider $date_to_consider = null,
        int             $break_minutes = 0,
        ?string         $machine_id_custom = null,
        ?string         $hall_id_custom = null,
        ?ShiftDto       $shift = null,
    )
    {
        $this->date = $date;
        $this->shift_id_custom = $shift_id_custom;
        $this->start_time = $start_time ?? '00:00';
        $this->end_time = $end_time ?? '00:00';
        $this->date_to_consider = $date_to_consider ?? DateToConsider::SHIFT_START();
        $this->break_minutes = $break_minutes;
        $this->machine_id_custom = $machine_id_custom;
        $this->hall_id_custom = $hall_id_custom;
        $this->shift = $shift;
    }
}