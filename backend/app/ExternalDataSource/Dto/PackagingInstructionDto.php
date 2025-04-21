<?php

namespace App\ExternalDataSource\Dto;

use App\Enums\PackagingInstructionMachineStopType;
use stdClass;

class PackagingInstructionDto
{
    public string $custom_id;
    public string $uuid;
    /**
     * @var PackagingInstructionPosDto[]
     */
    public array $positions;
    public PackagingInstructionMachineStopType $machineStopType;
    public bool $is_active;

    /**
     * @param string $custom_id
     * @param string $uuid
     * @param PackagingInstructionPosDto[] $positions
     * @param bool $is_active
     * @param PackagingInstructionMachineStopType $machineStopType
     */
    public function __construct(string $custom_id, string $uuid, array $positions = [], bool $is_active = true, PackagingInstructionMachineStopType $machineStopType = PackagingInstructionMachineStopType::NO_STOP)
    {
        $this->custom_id = $custom_id;
        $this->uuid = $uuid;
        $this->positions = $positions;
        $this->is_active = $is_active;
        $this->machineStopType = $machineStopType;
    }

    public static function fromStdClass(stdClass $obj): PackagingInstructionDto {
        $positions = collect($obj->positions ?? [])->map(function ($position) {
            return PackagingInstructionPosDto::fromStdClass($position);
        });

        return new PackagingInstructionDto(
            $obj->custom_id,
            $obj->uuid ?? null,
            $positions->toArray(),
            $obj->is_active ?? true,
            PackagingInstructionMachineStopType::tryFrom($obj->machineStopType) ?? PackagingInstructionMachineStopType::NO_STOP,
        );
    }
}