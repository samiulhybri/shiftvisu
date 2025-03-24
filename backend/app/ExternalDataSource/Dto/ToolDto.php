<?php

namespace App\ExternalDataSource\Dto;

class ToolDto
{
    public string $custom_id;
    public string $name;
    public bool $is_active;

    public ?int $construction_year;
    public int $cavity;
    public ?array $tool_group_custom_ids;
    public ?int $guaranteed_quantity;
    public ?string $storage_shelf;
    public ?string $storage_level;
    public ?string $storage_compartment;
    public ?string $storage_location;
    public ?string $main_tool_id;

    public function __construct(
        string $custom_id,
        string $name,
        bool $is_active = true,
        ?int $construction_year = null,
        int $cavity = 1,
        ?array $tool_group_custom_ids = null,
        ?int $guaranteed_quantity = 0,
        ?string $storage_shelf = null,
        ?string $storage_level = null,
        ?string $storage_compartment = null,
        ?string $storage_location = null,
        ?string $main_tool_id = null,
    ) {
        $this->custom_id = $custom_id;
        $this->name = $name;
        $this->is_active = $is_active;
        $this->construction_year = $construction_year;
        $this->cavity = $cavity;
        $this->tool_group_custom_ids = $tool_group_custom_ids;
        $this->guaranteed_quantity = $guaranteed_quantity;
        $this->storage_shelf = $storage_shelf;
        $this->storage_level = $storage_level;
        $this->storage_compartment = $storage_compartment;
        $this->storage_location = $storage_location;
        $this->main_tool_id = $main_tool_id;
    }
}
