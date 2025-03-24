<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SalesOrderPos extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function salesOrders(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(SalesOrder::class, 'sales_order_id');
    }

    #[LodataRelationship]
    public function classifications(): MorphMany
    {
        return $this->morphMany(Classification::class, 'model');
    }
    #[LodataRelationship]
    public function ValueOfZZV1(): \Illuminate\Database\Eloquent\Relations\MorphOne
    {
        return $this->morphOne(Classification::class, 'model')
            ->where('class', 'HWE')
            ->where('attribute', 'ZZV1');
    }
}
