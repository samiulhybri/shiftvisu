<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plant extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, "item_plants")
            ->withTimestamps();
    }

    #[LodataRelationship]
    public function itemPlants(): HasMany
    {
        return $this->hasMany(ItemPlant::class);
    }

    public function itemStateDefault(): BelongsTo
    {
        return $this->belongsTo(ItemState::class, 'item_state_id_default');
    }

    #[LodataRelationship]
    public function itemPackagingRework(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_packaging_rework');
    }

    #[LodataRelationship]
    public function itemPackagingScrap(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'item_id_packaging_scrap');
    }

    #[LodataRelationship]
    public function storageLocationRework(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class, 'storage_location_id_rework');
    }

    #[LodataRelationship]
    public function storageLocationScrap(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class, 'storage_location_id_scrap');
    }
    
    #[LodataRelationship]
    public function prodOrderPosOperationIndirect(): BelongsTo
    {
        return $this->belongsTo(ProdOrderPosOperation::class, 'prod_order_pos_operation_id_indirect');
    }
}
