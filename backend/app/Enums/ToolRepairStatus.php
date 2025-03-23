<?php

namespace App\Enums;
use Spatie\Enum\Laravel\Enum;

/**
 * @method static self READY_FOR_USE()
 * @method static self NOT_READY_FOR_USE()
 * @method static self MAINTENANCE_REQUIRED()
 * @method static self POSSIBLE()
 * @method static self NOT_POSSIBLE()
 */
final class ToolRepairStatus extends Enum
{
}
