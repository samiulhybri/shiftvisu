<?php

namespace App\Enums;

enum OperationControlProfileConfirmationType : string
{
    case MILESTONE = 'MILESTONE';
    case REQUIRED = 'REQUIRED';
    case PERMITTED = 'PERMITTED';
    case NOT_PERMITTED = 'NOT_PERMITTED';
}
