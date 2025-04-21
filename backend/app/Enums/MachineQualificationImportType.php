<?php

namespace App\Enums;

enum MachineQualificationImportType: string
{
    case NONE = 'NONE';
    case MACHINE_QUALIFICATION = 'MACHINE_QUALIFICATION';
    case MACHINE_ITEM_QUALIFICATION = 'MACHINE_ITEM_QUALIFICATION';
}
