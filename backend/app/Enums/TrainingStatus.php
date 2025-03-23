<?php

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;
/**
 * @method static self CREATED()
 * @method static self VIEWED()
 * @method static self IN_PROGRESS()
 * @method static self PENDING_REVIEW()
 * @method static self COMPLETED()
 * @method static self ARCHIVED()
 */
final class TrainingStatus extends Enum
{
}