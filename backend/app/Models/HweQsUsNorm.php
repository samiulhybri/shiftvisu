<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweQsUsNorm extends Model
{
    use HasFactory;
    #[LodataRelationship]
    public function prodOrderPos(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class, 'prod_order_pos_id');
    }
    
    #[LodataRelationship]
    public function prodOrderPosOperation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class, 'prod_order_pos_operation_id');
    }

    #[LodataRelationship]
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function adjustments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweQsUsNormAdjustment::class);
    }

    #[LodataRelationship]
    public function usNormTestScopes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweQsUsNormTestScope::class);
    }

    #[LodataRelationship]
    public function usNormTestSections(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweQsUsNormTestSection::class);
    }

    #[LodataRelationship]
    public function usNormRatings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(HweQsUsNormRating::class);
    }
}
