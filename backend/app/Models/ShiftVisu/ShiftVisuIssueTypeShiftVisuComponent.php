<?php

namespace App\Models\ShiftVisu;

use App\Models\ShiftVisu\ShiftVisuComponent;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftVisuIssueTypeShiftVisuComponent extends Model
{
    protected $table = 'shift_visu_issue_type_shift_visu_components';

    public function component()
    {
        return $this->belongsTo(ShiftVisuComponent::class, 'shift_visu_component_id');
    }
}
