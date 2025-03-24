<?php

namespace App\Models\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class JpiResourceGroup extends Model
{
    use HasFactory;
    protected $guarded = [];
    #[LodataRelationship]
    public function jpiResourceCategory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(JpiResourceCategory::class);
    }

    public function jpiResources(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiResource::class, 'jpi_resource_resource_groups');
    }
    public function jpiTasks(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiTask::class, 'jpi_task_resource_group_constraints');
    }

}
