<?php

namespace App\Enums;

enum ComponentPreparationState : string
{
    case NOT_PREPARED = 'NOT_PREPARED';
    case PARTIALLY_PREPARED = 'PARTIALLY_PREPARED';
    case PREPARED = 'PREPARED';
}
