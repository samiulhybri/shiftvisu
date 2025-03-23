<?php

namespace App\Models;

use App\Models\ShiftVisu\ShiftVisuIssueType;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Hall extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custom_id',
        'name',
        'is_enabled_plan_visu',
        'is_active'
    ];

    #[LodataRelationship]
    public function machines(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Machine::class);
    }

    #[LodataRelationship]
    public function topMachine(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Machine::class);  //Check, is hall associated with any machine or not
    }

    #[LodataRelationship]
    public function machineGroup(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MachineGroup::class);
    }

    public function itemStates(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(ItemState::class, 'item_state_halls');
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'department_hall');
    }

    #[LodataRelationship]
    public function capacities(): MorphMany
    {
        return $this->morphMany(Capacity::class, 'capacitable');
    }

    #[LodataRelationship]
    public function shiftVisuIssueTypes()
    {
        return $this->belongsToMany(ShiftVisuIssueType::class);
    }
    
    #[LodataRelationship]
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
