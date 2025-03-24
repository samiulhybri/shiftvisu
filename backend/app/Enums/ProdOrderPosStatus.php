<?php

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self PLANNED()
 * @method static self IN_PRODUCTION()
 * @method static self IN_MAINTENANCE()
 * @method static self CLOSED()
 * @method static self DELETED()
 */
final class ProdOrderPosStatus extends Enum
{
}
