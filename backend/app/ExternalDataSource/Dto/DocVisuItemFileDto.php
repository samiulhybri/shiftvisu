<?php

namespace App\ExternalDataSource\Dto;


class DocVisuItemFileDto
{
    public string $drawing_code;
    public string $item_id_custom;
    public string $file_extension;

    public function __construct(
        string $drawing_code,
        string $item_id_custom,
        string $file_extension
    ) {
        $this->drawing_code = $drawing_code;
        $this->item_id_custom = $item_id_custom;
        $this->file_extension = $file_extension;
    }
}