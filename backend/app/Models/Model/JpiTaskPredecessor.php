<?php

namespace App\Models\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JpiTaskPredecessor extends Model
{
    use HasFactory;
    protected $fillable = [
        'jpi_task_id',
        'predecessor_jpi_task_id'
    ];
    public $timestamps = false;
}
