<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HweFreightCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'country_id',
        'postal_code_from',
        'postal_code_to',
        'delivery_weight_from',
        'delivery_weight_to',
        'price',
    ];
}
