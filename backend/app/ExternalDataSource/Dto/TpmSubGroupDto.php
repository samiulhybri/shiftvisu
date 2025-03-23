<?php

namespace App\ExternalDataSource\Dto;

class TpmSubGroupDto
{
    public string $custom_id;
    public string $name;
    public string $tpm_group_id_custom;
    public ?string $xml_id;

    public function __construct(
        string $custom_id,
        string $name,
        string $tpm_group_id_custom,
        ?string $xml_id = null
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->tpm_group_id_custom = $tpm_group_id_custom;
        $this->xml_id = $xml_id;
    }
}