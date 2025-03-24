<?php

namespace App\ExternalDataSource\Dto;

class BomDto
{
    public string $custom_id;
    public ?string $name;

    /**
     * @var BomPosDto[]
     */
    public array $bom_pos;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        ?string $name = null,
        array $bom_pos = [],
        ?string $xml_id = null,
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->bom_pos = $bom_pos;
        $this->xml_id = $xml_id;
    }
}
