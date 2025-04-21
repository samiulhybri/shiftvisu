<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\ProdOrderPosOperationStatus;
use stdClass;

class ProdOrderPosOperationDto
{
    public string $pos;
    public string $name;
    public ?string $start;
    public ?string $end;
    public float $te;
    public float $tr;
    public int $cavity;
    public ?string $machine_id_custom;
    public ?string $tool_id_custom;
    public ?string $tool_insert_id_custom;
    public ?string $user_group_id_custom;
    public ?string $resource_group_id_custom;
    public ?string $machine_group_id_custom;
    public ?string $operation_code;
    public ProdOrderPosOperationStatus $status;
    public ?string $note;
    public ?string $component_availability;
    public int $teardown_time;
    public int $transfer_time;
    public bool $has_labels_prepared;
    public int $registered_quantity;
    public ?int $tool_reference_nr;
    public float $operator_usage_factor;
    public ?float $send_ahead_quantity;
    public ?string $plant_id_production_custom;
    public ?string $operation_control_profile_id_custom;
    public float $quantity;
    public ?string $unit_of_measure_id_custom;
    public ?string $prod_lot_id_custom;
    /**
     * @var ProdOrderPosOperationResourceDto[]
     */
    public array $resources;

    /**
     * @var ProdOrderPosOperationAltMachineDto[]
     */
    public array $alt_machines;

    /**
     * @var ClassificationDto[]
     */
    public array $classifications;

    /**
     * @var ProdInspectionOperationDto[]
     */
    public array $inspectionOperations;

    public function __construct(
        string                       $pos,
        string                       $name,
        ?string                      $start = null,
        ?string                      $end = null,
        float                        $te = 0.0,
        float                        $tr = 0.0,
        int                          $cavity = 1,
        ?string                      $machine_id_custom = null,
        ?string                      $tool_id_custom = null,
        ?string                      $tool_insert_id_custom = null,
        ?string                      $user_group_id_custom = null,
        ?string                      $resource_group_id_custom = null,
        ?string                      $machine_group_id_custom = null,
        ?string                      $operation_code = null,
        ?ProdOrderPosOperationStatus $status = null,
        ?string                      $note = null,
        ?string                      $component_availability = null,
        int                          $teardown_time = 0,
        int                          $transfer_time = 0,
        bool                         $has_labels_prepared = false,
        int                          $registered_quantity = 0,
        ?int                         $tool_reference_nr = null,
        float                        $operator_usage_factor = 1,
        ?float                       $send_ahead_quantity = null,
        ?string                      $plant_id_production_custom = null,
        ?string                      $operation_control_profile_id_custom = null,
        float                        $quantity = 0,
        ?string                      $unit_of_measure_id_custom = null,
        ?string                      $prod_lot_id_custom = null,
        array                        $resources = [],
        array                        $alt_machines = [],
        array                        $classifications = [],
        array                        $inspectionOperations = [],
    )
    {
        $this->pos = $pos;
        $this->name = $name;
        $this->start = $start;
        $this->end = $end;
        $this->te = $te;
        $this->tr = $tr;
        $this->cavity = $cavity;
        $this->machine_id_custom = $machine_id_custom;
        $this->tool_id_custom = $tool_id_custom;
        $this->tool_insert_id_custom = $tool_insert_id_custom;
        $this->user_group_id_custom = $user_group_id_custom;
        $this->resource_group_id_custom = $resource_group_id_custom;
        $this->machine_group_id_custom = $machine_group_id_custom;
        $this->operation_code = $operation_code;
        $this->status = $status ?? ProdOrderPosOperationStatus::PLANNED();
        $this->note = $note;
        $this->component_availability = $component_availability;
        $this->teardown_time = $teardown_time;
        $this->transfer_time = $transfer_time;
        $this->has_labels_prepared = $has_labels_prepared;
        $this->registered_quantity = $registered_quantity;
        $this->tool_reference_nr = $tool_reference_nr;
        $this->operator_usage_factor = $operator_usage_factor;
        $this->send_ahead_quantity = $send_ahead_quantity;
        $this->plant_id_production_custom = $plant_id_production_custom;
        $this->operation_control_profile_id_custom = $operation_control_profile_id_custom;
        $this->quantity = $quantity;
        $this->unit_of_measure_id_custom = $unit_of_measure_id_custom;
        $this->prod_lot_id_custom = $prod_lot_id_custom;
        $this->resources = $resources;
        $this->alt_machines = $alt_machines;
        $this->classifications = $classifications;
        $this->inspectionOperations = $inspectionOperations;
    }

    public static function fromStdClass(stdClass $obj): ProdOrderPosOperationDto
    {
        $resources = collect($obj->resources ?? [])->map(function ($resource) {
            return ProdOrderPosOperationResourceDto::fromStdClass($resource);
        });
        $alt_machines = collect($obj->alt_machines ?? [])->map(function ($alt_machine) {
            return ProdOrderPosOperationAltMachineDto::fromStdClass($alt_machine);
        });
        $classifications = collect($obj->classifications ?? [])->map(function ($classification) {
            return ClassificationDto::fromStdClass($classification);
        });
        $inspectionOperations = collect($obj->inspectionOperations ?? [])->map(function ($inspectionOperation) {
            return ProdInspectionOperationDto::fromStdClass($inspectionOperation);
        });
        return new ProdOrderPosOperationDto(
            $obj->pos,
            $obj->name,
            $obj->start ?? null,
            $obj->end ?? null,
            $obj->te ?? 0.0,
            $obj->tr ?? 0.0,
            $obj->cavity ?? 1,
            $obj->machine_id_custom ?? null,
            $obj->tool_id_custom ?? null,
            $obj->tool_insert_id_custom ?? null,
            $obj->user_group_id_custom ?? null,
            $obj->resource_group_id_custom ?? null,
            $obj->machine_group_id_custom ?? null,
            $obj->operation_code ?? null,
            ProdOrderPosOperationStatus::tryFrom($obj->status) ?? null,
            $obj->note ?? null,
            $obj->component_availability ?? null,
            $obj->teardown_time ?? 0,
            $obj->transfer_time ?? 0,
            $obj->has_labels_prepared ?? false,
            $obj->registered_quantity ?? 0,
            $obj->tool_reference_nr ?? null,
            $obj->operator_usage_factor ?? 1,
            $obj->send_ahead_quantity ?? null,
            $obj->plant_id_production_custom ?? null,
            $obj->operation_control_profile_id_custom ?? null,
            $obj->quantity ?? 0,
            $obj->unit_of_measure_id_custom ?? null,
            $obj->prod_lot_id_custom ?? null,
            $resources->toArray(),
            $alt_machines->toArray(),
            $classifications->toArray(),
            $inspectionOperations->toArray(),
        );
    }
}
