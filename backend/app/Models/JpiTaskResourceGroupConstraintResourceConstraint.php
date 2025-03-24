<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JpiTaskResourceGroupConstraintResourceConstraint extends Model
{
    use HasFactory;
    protected $fillable = [
        'jpi_task_resource_group_constraint_id',
        'jpi_resource_id'
    ];
}
