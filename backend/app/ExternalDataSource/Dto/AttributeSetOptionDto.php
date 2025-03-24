<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\AttributeSetOptionValuation;

class AttributeSetOptionDto
{
    public string $custom_id;
    public AttributeSetOptionValuation $valuation;

    public function __construct(
        string  $custom_id,
        AttributeSetOptionValuation $valuation = AttributeSetOptionValuation::SKIP,
    )
    {
        $this->custom_id = $custom_id;
        $this->valuation = $valuation;
    }
}