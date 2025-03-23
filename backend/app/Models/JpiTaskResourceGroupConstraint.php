<?php

namespace App\Models;

use App\Models\Model\JpiResource;
use App\Models\Model\JpiResourceGroup;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JpiTaskResourceGroupConstraint extends Model
{
    use HasFactory;
    protected $fillable = [
        'jpi_task_id',
        'jpi_resource_group_id'
    ];

    public function jpiResourceGroup(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResourceGroup::class);
    }

    public function resourceConstraints(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            JpiResource::class,
            "jpi_task_resource_group_constraint_resource_constraints"
        );
    }
}
