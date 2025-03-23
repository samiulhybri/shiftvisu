<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ItemPlant extends Model
{
    protected $guarded = [];

    #[LodataRelationship]
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }

    public function storageLocation(): BelongsTo
    {
        return $this->belongsTo(StorageLocation::class);
    }

    #[LodataRelationship]
    public function storageLocations(): BelongsToMany
    {
        return $this->belongsToMany(StorageLocation::class, "item_plant_storage_locations");
    }

    public function serialNumberProfile(): BelongsTo
    {
        return $this->belongsTo(SerialNumberProfile::class);
    }
    
    #[LodataRelationship]
    public function stocks(): MorphMany
    {
        return $this->morphMany(Stock::class, 'stockable');
    }
}
