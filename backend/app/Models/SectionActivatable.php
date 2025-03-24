<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SectionActivatable extends Model
{
    protected $fillable = ['activatable_id', 'activatable_type', 'section', 'is_active'];
    use HasFactory;
}
