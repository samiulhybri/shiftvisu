<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MachineDailyExpectedQuantity extends Model
{
    protected $fillable = [
        'machine_id',
        'item_id',
        'date',
        'quantity',
        'te',
        'tr',
        'teardown_time',
        'shift_id',
        'workloadable_id',
        'workloadable_type',
        'cavity',
    ];
}
