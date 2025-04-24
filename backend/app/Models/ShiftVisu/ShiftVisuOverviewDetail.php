<?php

namespace App\Models\ShiftVisu;

use App\Models\Chat;
use App\Models\User;
use App\Models\Hall;
use App\Models\ShiftVisu\ShiftVisuIssueType;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Model;

class ShiftVisuOverviewDetail extends Model
{
    protected $fillable = [
        'hall_id',
        'creator_id',
        'error_id',
        'error_type',
        'description',
        'chat_id',
    ];

    #[LodataRelationship]
    public function hall()
    {
        return $this->belongsTo(Hall::class, 'hall_id');
    }

    #[LodataRelationship]
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    #[LodataRelationship]
    public function error()
    {
        return $this->belongsTo(ShiftVisuIssueType::class, 'error_id');
    }

    #[LodataRelationship]
    public function componentOptions()
    {
        return $this->hasMany(ShiftVisuOverviewComponentOption::class, 'overview_details_id', 'id');
    }

    #[LodataRelationship()]
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}
