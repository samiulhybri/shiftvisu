<?php

namespace App\ExternalDataSource\Dto;

use Carbon\Carbon;

class OffDayDto
{
    public string $user_id_custom;
    public Carbon $date;

    public function __construct(
        string $user_id_custom,
        Carbon $date
    )
    {
        $this->user_id_custom = $user_id_custom;
        $this->date = $date;
    }
}