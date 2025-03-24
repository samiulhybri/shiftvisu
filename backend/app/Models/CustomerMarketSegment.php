<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerMarketSegment extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    
    #[LodataRelationship]
    public function marketSegment(): BelongsTo
    {
        return $this->belongsTo(MarketSegment::class);
    }
}
