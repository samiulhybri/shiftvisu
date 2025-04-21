<?php

namespace App\Enums;

enum DataImportName: string
{
    case HANDLING_UNIT = 'HANDLING_UNIT';
    case STOCK = 'STOCK';
    case PROD_ORDER = 'PROD_ORDER';
    case PACKAGING_INSTRUCTION = 'PACKAGING_INSTRUCTION';
    case DEFAULT_PACKAGING_INSTRUCTION = 'DEFAULT_PACKAGING_INSTRUCTION';
    case USER = 'USER';
    case ITEM = 'ITEM';
}
