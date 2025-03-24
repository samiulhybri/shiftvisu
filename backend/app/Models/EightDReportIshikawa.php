<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EightDReportIshikawa extends Model
{
    use HasFactory;

    public function eightDReport()
    {
        return $this->belongsTo(EightDReport::class);
    }
}
