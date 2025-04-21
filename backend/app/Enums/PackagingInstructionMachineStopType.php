<?php

namespace App\Enums;

enum PackagingInstructionMachineStopType: string
{
    case NO_STOP = 'NO_STOP';
    case HU_FULL = 'HU_FULL';
    case HU_LEVEL_2_FULL = 'HU_LEVEL_2_FULL';
    case OPERATION_QUANTITY_REACHED = 'OPERATION_QUANTITY_REACHED';
}
