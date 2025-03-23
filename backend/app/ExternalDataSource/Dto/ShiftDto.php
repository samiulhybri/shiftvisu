<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\DateToConsider;

class ShiftDto
{
    public string $custom_id;
    public string $name;
    public string $start_time;
    public string $end_time;
    public DateToConsider $date_to_consider;
    public int $break_minutes;

    public function __construct(
        string          $custom_id,
        string          $name,
        string          $start_time,
        string          $end_time,
        ?DateToConsider $date_to_consider = null,
        int             $break_minutes = 0
    )
    {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->start_time = $start_time;
        $this->end_time = $end_time;
        $this->date_to_consider = $date_to_consider ?? DateToConsider::SHIFT_START();
        $this->break_minutes = $break_minutes;
    }
}