<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MarkerRecipePos extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function markerRecipe(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(MarkerRecipe::class);
    }

    #[LodataRelationship]
    public function markerRecipePosBlock(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MarkerRecipePosBlock::class, 'marker_recipe_pos_id');
    }
}
