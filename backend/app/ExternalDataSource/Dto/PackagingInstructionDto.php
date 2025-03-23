<?php

namespace App\ExternalDataSource\Dto;

class PackagingInstructionDto
{
    public string $custom_id;
    public string $uuid;
    /**
     * @var PackagingInstructionPosDto[]
     */
    public array $positions;
    public bool $is_active;

    /**
     * @param string $custom_id
     * @param PackagingInstructionPosDto[] $positions
     */
    public function __construct(string $custom_id, string $uuid, array $positions = [], bool $is_active = true)
    {
        $this->custom_id = $custom_id;
        $this->positions = $positions;
        $this->is_active = $is_active;
        $this->uuid = $uuid;
    }
}