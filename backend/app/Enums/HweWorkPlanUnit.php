<?php

namespace App\Enums;

enum HweWorkPlanUnit: string
{
    case MIN = 'MIN';
    case EURO = 'EURO';
    case STK = 'STK';
    case KG = 'KG';

    public static function toArray(): array
  {
      return array_column(HweWorkPlanUnit::cases(), 'value');
  }
}
