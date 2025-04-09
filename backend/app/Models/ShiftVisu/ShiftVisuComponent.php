<?php

namespace App\Models\ShiftVisu;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftVisuComponent extends Model
{
    protected $fillable = [
        'custom_id',
        'view_in',
        'measure_options',
    ];

    use HasFactory;

    #[LodataRelationship]
    public function shiftVisuComponentOptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ShiftVisuComponentOption::class);
    }
}
