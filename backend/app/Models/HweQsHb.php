<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweQsHb extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function prodOrderPos(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class);
    }
    #[LodataRelationship]
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ProdOrderPosOperation::class);
    }
    #[LodataRelationship]
    public function hweQsHbPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweQsHbPos::class, 'hwe_qs_hb_id');
    }
}
