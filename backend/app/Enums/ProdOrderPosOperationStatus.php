<?php

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self PROPOSED()
 * @method static self TERMINATED()
 * @method static self PLANNED()
 * @method static self SUSPENDED()
 * @method static self WAITING_FOR_PREPARATION()
 * @method static self IN_PREPARATION()
 * @method static self WAITING_FOR_SETUP()
 * @method static self IN_SETUP()
 * @method static self IN_TEARDOWN()
 * @method static self IN_PRODUCTION()
 * @method static self CLOSED()
 * @method static self DELETED()
 * @method static self CANCELLED()
 */
final class ProdOrderPosOperationStatus extends Enum
{
}
