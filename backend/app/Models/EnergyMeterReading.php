<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnergyMeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'energy_consumer_id',
        'value',
        'energy_type',
        'energy_meter_id',
    ];
}
