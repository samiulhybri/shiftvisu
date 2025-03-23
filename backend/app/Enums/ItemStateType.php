<?php

namespace App\Enums;

use Spatie\Enum\Laravel\Enum;

/**
 * @method static self GOOD()
 * @method static self SCRAP()
 * @method static self REWORK()
 */
final class ItemStateType extends Enum
{
    public function getHandlingUnitType(): ProdOrderPosOperationHandlingUnitType
    {
        return match ($this) {
            ItemStateType::SCRAP() => ProdOrderPosOperationHandlingUnitType::PROD_SCRAP(),
            ItemStateType::REWORK() => ProdOrderPosOperationHandlingUnitType::PROD_REWORK(),
            default => ProdOrderPosOperationHandlingUnitType::PROD_GOOD(),
        };
    }

    public function getHandlingUnitTypeLevel2(): ProdOrderPosOperationHandlingUnitType
    {
        return match ($this) {
            ItemStateType::SCRAP() => ProdOrderPosOperationHandlingUnitType::PROD_SCRAP(),
            ItemStateType::REWORK() => ProdOrderPosOperationHandlingUnitType::PROD_REWORK(),
            default => ProdOrderPosOperationHandlingUnitType::PROD_GOOD(),
        };
    }
}
