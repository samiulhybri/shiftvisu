<?php

namespace App\Enums;

enum ShiftVisuComponentTypeEnum: string
{   case CHECKBOX = 'CHECKBOX';
    case COMBOBOX = 'COMBOBOX';
    case DROPDOWN_SINGLE = 'DROPDOWN_SINGLE';
    case DROPDOWN_MULTI = 'DROPDOWN_MULTI';
    case TEXTFIELD = 'TEXTFIELD';
    case TEXTAREA = 'TEXTAREA';
    case SWITCH = 'SWITCH';
    case DATE = 'DATE';
    case DATETIME = 'DATETIME';
    case RADIO = 'RADIO';
    case MEASURE = 'MEASURE';
}