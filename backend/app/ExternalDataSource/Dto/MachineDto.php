<?php

namespace App\ExternalDataSource\Dto;

use App\ExternalDataSource\Dto\TranslatedPropertyDto;

class MachineDto
{
    public string $custom_id;

    /**
     * @var TranslatedPropertyDto[]
     */
    public array $name;

    public bool $is_active;

    public ?string $xml_id;
    public ?string $machine_group_id_custom;
    public ?string $tpm_sub_group_id_custom;
    public ?float $usage_factor;
    public ?float $tr;
    public ?float $lead_time_days;
    public ?int $construction_year;
    public ?bool $is_furnace;
    public ?bool $is_casting_machine;
    public ?string $hall_id_custom;
    public ?string $cost_center_id_custom;
    public ?bool $is_enabled_for_tpm_visu;
    /**
     * @var string[]
     */
    public array $resource_groups_ids_custom;
    public ?string $plant_id_custom;
    public ?string $production_supply_area_id_custom;
    public ?string $standard_value_key_id_custom;

    public ?bool $is_enabled_for_plan_visu;
    /**
     * MachineDto constructor.
     *
     * @param string $custom_id
     * @param string|TranslatedPropertyDto[] $name
     * @param bool $is_active
     * @param string|null $xml_id
     * @param string|null $machine_group_id_custom
     * @param string|null $tpm_sub_group_id_custom
     * @param float|null $usage_factor
     * @param float|null $tr
     * @param int|null $construction_year
     * @param bool|null $is_furnace
     * @param bool|null $is_casting_machine
     * @param string|null $hall_id_custom
     * @param string|null $cost_center_id_custom
     * @param bool|null $is_enabled_for_tpm_visu
     * @param string[] $resource_groups_ids_custom
     * @param ?string $plant_id_custom
     * @param ?string $production_supply_area_id_custom
     * @param ?string $standard_value_key_id_custom
     */
    public function __construct(
        string       $custom_id,
        string|array $name,
        bool         $is_active = true,
        ?string      $xml_id = null,
        ?string      $machine_group_id_custom = null,
        ?string      $tpm_sub_group_id_custom = null,
        ?float       $usage_factor = null,
        ?float       $tr = null,
        ?int         $construction_year = null,
        ?bool        $is_furnace = null,
        ?bool        $is_casting_machine = null,
        ?string      $hall_id_custom = null,
        ?string      $cost_center_id_custom = null,
        ?bool        $is_enabled_for_tpm_visu = null,
        array        $resource_groups_ids_custom = [],
        ?string      $plant_id_custom = null,
        ?string      $production_supply_area_id_custom = null,
        ?string      $standard_value_key_id_custom = null,
        ?bool        $is_enabled_for_plan_visu = null,
        ?float       $lead_time_days = null
    )
    {
        $this->custom_id = $custom_id;
        $this->name = TranslatedPropertyDto::from($name);
        $this->is_active = $is_active;
        $this->xml_id = $xml_id;
        $this->machine_group_id_custom = $machine_group_id_custom;
        $this->tpm_sub_group_id_custom = $tpm_sub_group_id_custom;
        $this->usage_factor = $usage_factor;
        $this->tr = $tr;
        $this->construction_year = $construction_year;
        $this->is_furnace = $is_furnace;
        $this->is_casting_machine = $is_casting_machine;
        $this->hall_id_custom = $hall_id_custom;
        $this->cost_center_id_custom = $cost_center_id_custom;
        $this->is_enabled_for_tpm_visu = $is_enabled_for_tpm_visu;
        $this->resource_groups_ids_custom = $resource_groups_ids_custom;
        $this->plant_id_custom = $plant_id_custom;
        $this->production_supply_area_id_custom = $production_supply_area_id_custom;
        $this->standard_value_key_id_custom = $standard_value_key_id_custom;
        $this->lead_time_days = $lead_time_days;
        $this->is_enabled_for_plan_visu = $is_enabled_for_plan_visu;
    }
}
