<?php

namespace App\Models\ShiftVisu;

use App\Models\Hall;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftVisuIssueType extends Model
{
    protected $fillable = ['custom_id', 'name', 'is_active'];
    
    use HasFactory;

    #[LodataRelationship()]
    public function halls()
    {
        return $this->belongsToMany(Hall::class, 'hall_shift_visu_issue_type');
    }

    #[LodataRelationship()]
    public function components()
    {
        return $this->belongsToMany(
            ShiftVisuComponent::class, 
            'shift_visu_issue_type_shift_visu_components', 
        )->withPivot('is_mandatory');
    }
}
