<?php

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;
/**
 * @method static self DELIVERED()
 * @method static self PROCESSING()
 * @method static self NOT_ACCEPTED()
 */
final class TransportOrderPosStatus extends Enum
{
}