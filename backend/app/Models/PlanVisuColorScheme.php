<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanVisuColorScheme extends Model
{
    use HasFactory;
    
    #[LodataRelationship]
    public function planVisuColorSchemeSorting(): HasMany
    {
        return $this->hasMany(PlanVisuColorSchemeSorting::class);
    }
}
