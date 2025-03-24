<?php

namespace App\Models\ShiftVisu;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftVisuComponentOption extends Model
{
    use HasFactory;

    #[LodataRelationship]
    public function shiftVisuComponent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ShiftVisuComponent::class);
    }
}
