<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpOfferLog extends Model
{
    use HasFactory;
    
    #[LodataRelationship]
    public function mpOffer(): BelongsTo {
        return $this->belongsTo(MpOffer::class);
    }

    #[LodataRelationship]
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
