<?php

namespace App\Models;

use Carbon\Carbon;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CostCenter extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function costCenterCostToday(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CostCenterCost::class)
            ->whereDate('valid_from', '<=', Carbon::now())
            ->whereDate('valid_to', '>=', Carbon::now());
    }
}
