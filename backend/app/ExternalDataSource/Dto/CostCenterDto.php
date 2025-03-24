<?php

namespace App\ExternalDataSource\Dto;

class CostCenterDto
{
    public string $custom_id;
    public bool $is_active;
    public string $valid_from;
    public string $valid_to;
    public float $cost;
    public string $cost_type;
    public ?string $xml_id;
}