<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class PlanVisuColorSchemeSorting extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function colorScheme(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(PlanVisuColorScheme::class, 'plan_visu_color_scheme_id');
    }
}
