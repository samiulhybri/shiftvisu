<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TransportOrderPos extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function prodOrderPosBomPos(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosBomPos::class);
    }

    #[LodataRelationship]
    public function transportOrder(): BelongsTo
    {
        return $this->belongsTo(TransportOrder::class);
    }

    #[LodataRelationship]
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
    
    #[LodataRelationship]
    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    #[LodataRelationship]
    public function transportOrderPosDeliveries(): HasMany
    {
        return $this->hasMany(TransportOrderPosDeliveries::class);
    }
    
    #[LodataRelationship]
    public function transportOrderType(): BelongsTo
    {
        return $this->belongsTo(TransportOrderType::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }

    public function destination(): MorphTo
    {
        return $this->morphTo();
    }

    public function transportable()
    {
        return $this->morphTo();
    }

    #[LodataRelationship]
    public function itemPlant(): BelongsTo
    {
        return $this->belongsTo(ItemPlant::class, 'transportable_id');
    }
    
    #[LodataRelationship]
    public function handlingUnit(): BelongsTo
    {
        return $this->belongsTo(HandlingUnit::class, 'transportable_id');
    }
    
    #[LodataRelationship]
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class, 'transportable_id');
    }
}
