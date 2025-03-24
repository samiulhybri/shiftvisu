<?php

namespace App\ExternalDataSource\Dto;

class UnitOfMeasureConversionDto
{
    public string $unit_of_measure_id_custom;
    public int $quantity_denominator;
    public int $quantity_numerator;

    public function __construct(
        string $unit_of_measure_id_custom,
        int    $quantity_denominator,
        int    $quantity_numerator
    )
    {
        $this->unit_of_measure_id_custom = $unit_of_measure_id_custom;
        $this->quantity_denominator = $quantity_denominator;
        $this->quantity_numerator = $quantity_numerator;
    }
}