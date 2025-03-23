<?php

namespace App\ExternalDataSource\Dto;

class TpmGroupDto
{
    public string $custom_id;
    public string $name;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        string $name,
        ?string $xml_id = null
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->xml_id = $xml_id;
    }
}