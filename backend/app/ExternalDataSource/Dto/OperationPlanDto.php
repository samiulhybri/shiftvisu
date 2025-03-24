<?php

namespace App\ExternalDataSource\Dto;

class OperationPlanDto
{
    public string $custom_id;
    public bool $isImported;

    /**
     * @var OperationPlanPosDto[]
     */
    public array $operation_plan_pos;

    public function __construct(
        string $custom_id,
        array $operation_plan_pos  = [],
        bool $isImported = false
    ) {
        $this->custom_id = $custom_id;
        $this->operation_plan_pos = $operation_plan_pos;
        $this->isImported = $isImported;

    }
}
