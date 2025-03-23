<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Equipment extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function parent()
    {
        return $this->belongsTo(Equipment::class, 'equipment_id_parent');
    }

    public function children()
    {
        return $this->hasMany(Equipment::class, 'equipment_id_parent');
    }

    #[LodataRelationship]
    public function stocks(): MorphMany
    {
        return $this->morphMany(Stock::class, 'stockable');
    }
}
