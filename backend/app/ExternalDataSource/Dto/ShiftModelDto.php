<?php

namespace App\ExternalDataSource\Dto;

class ShiftModelDto
{
    public string $custom_id;
    public string $name;

    /**
     *  @var ShiftDto[]
     */
    public array $shifts;

    public function __construct(
        string $custom_id,
        string $name,
        array $shifts
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->shifts = $shifts;
    }
}
