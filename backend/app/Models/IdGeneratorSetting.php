<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IdGeneratorSetting extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $fillable = [
        'entity',
        'table',
        'prefix',
        'field',
        'length' 
    ];
}
