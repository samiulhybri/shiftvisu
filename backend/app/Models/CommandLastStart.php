<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommandLastStart extends Model
{
    use HasFactory;

    protected $fillable = ['command', 'last_start'];
}
