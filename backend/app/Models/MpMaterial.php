<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'name',
        'density',
        'price'
    ];

    #[LodataRelationship]
    public function mpOfferPos(): BelongsTo {
        return $this->belongsTo(MpOfferPos::class);
    }
}
