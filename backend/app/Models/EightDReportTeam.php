<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EightDReportTeam extends Model
{
    use HasFactory;

    public function eightDReport()
    {
        return $this->belongsTo(EightDReport::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
