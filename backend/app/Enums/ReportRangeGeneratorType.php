<?php

namespace App\Enums;

enum ReportRangeGeneratorType: string
{
    case DAY = 'DAY';
    case WEEK = 'WEEK';
    case MONTH = 'MONTH';
}
