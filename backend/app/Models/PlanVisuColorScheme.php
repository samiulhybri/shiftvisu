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

    public function createColorSchemeSorting(): PlanVisuColorSchemeSorting {
        $newSort = new PlanVisuColorSchemeSorting();
        $newSort->plan_visu_color_scheme_id = $this->id;
        $newSort->sorting = 0;
        $newSort->model_type = '';
        $newSort->model_column = '';
        $newSort->value_string = '';
        $newSort->color = 'ffffff';
        $newSort->has_border = 0;
        $newSort->border_color = '';
        $newSort->save();

        return $newSort;
    }
}
