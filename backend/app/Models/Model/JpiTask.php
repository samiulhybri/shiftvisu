<?php

namespace App\Models\Model;

use App\Models\JpiTaskResourceGroupConstraint;
use App\Models\ProdOrderPosOperation;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class JpiTask extends Model
{
    use HasFactory;
    protected $guarded = [];
    public function jpiJobs(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiJob::class, 'jpi_job_tasks');
    }

    public function jpiResGroups(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiResourceGroup::class, 'jpi_task_resource_group_constraints')->withPivot('usage_factor');
    }

    public function jpiResourceGroupConstraints(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(JpiTaskResourceGroupConstraint::class);
    }

    public function predecessorJpiTasks(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiTask::class, 'jpi_task_predecessors', 'jpi_task_id', 'predecessor_jpi_task_id');
    }

    public function assignedResource1(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResource::class, 'assigned_resource1');
    }

    public function assignedResource2(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResource::class, 'assigned_resource2');
    }

    public function assignedResourceGroup1(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResourceGroup::class, 'assigned_resource_group1');
    }

    public function assignedResourceGroup2(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResourceGroup::class, 'assigned_resource_group2');
    }

    public function processingResource1(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResource::class, 'processing_resource1');
    }

    public function processingResource2(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResource::class, 'processing_resource2');
    }
}
