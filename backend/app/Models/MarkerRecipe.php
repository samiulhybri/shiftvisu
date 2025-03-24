<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarkerRecipe extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
    
    #[LodataRelationship]
    public function markerRecipePos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MarkerRecipePos::class, 'marker_recipe_id');
    }

    #[LodataRelationship]
    public function machine(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }
}
