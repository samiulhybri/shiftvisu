<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MpPersonnel extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_id',
        'name',
        'cost_sub_group',
        'price'
    ];
}
