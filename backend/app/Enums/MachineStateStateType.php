<?php

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 *  @method static self PRODUCTION()
 *  @method static self SETUP()
 *  @method static self STANDSTILL()
 *  @method static self OFF()
 *  @method static self READY()
 */
final class MachineStateStateType extends Enum
{
}
