<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweQsImpactTest extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function prodOrderPos(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id');
    }
    #[LodataRelationship]
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class, 'prod_order_pos_operation_id');
    }

    #[LodataRelationship]
    public function hweQsSample(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(HweQsSample::class, 'hwe_qs_sample_id');
    }

    #[LodataRelationship]
    public function hweQsImpactTestPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweQsImpactTestPos::class);
    }

    #[LodataRelationship]
    public function hweQsImpactTestPosFirst(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(HweQsImpactTestPos::class);
    }
}
