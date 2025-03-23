<?php

namespace App\Models\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JpiJob extends Model
{
    use HasFactory;

    protected $guarded = [];
    protected $fillable = [
        'jpi_guid',
        'planned_start',
        'planned_end'
    ];

    public function jpiTasks(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiTask::class, 'jpi_job_tasks');
    }
}
