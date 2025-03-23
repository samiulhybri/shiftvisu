<?php

namespace App\Enums;

enum OperationControlProfileExternalProcessingType : string
{
    case INTERNAL = 'INTERNAL';
    case EXTERNAL = 'EXTERNAL';
    case INTERNAL_EXTERNAL = 'INTERNAL_EXTERNAL';
}
