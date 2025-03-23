<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ProdOrderPosBomPos extends Model
{
    protected $guarded = [];

    use HasFactory;

    #[LodataRelationship]
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    #[LodataRelationship]
    public function prodOrderPosOperation(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class);
    }

    #[LodataRelationship]
    public function prodOrderPos(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPos::class);
    }

    #[LodataRelationship]
    public function storageBin(): BelongsTo
    {
        return $this->belongsTo(StorageBin::class);
    }

    #[LodataRelationship]
    public function unitOfMeasure(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class);
    }

    #[LodataRelationship]
    public function classifications(): MorphMany
    {
        return $this->morphMany(Classification::class, 'model');
    }

    #[LodataRelationship]
    public function melt()
    {
        return $this->morphOne(Classification::class, 'model')->where('class', 'HWE')->where('attribute', 'Z_SCHMELZE');
    }
}
