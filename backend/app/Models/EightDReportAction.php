<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EightDReportAction extends Model
{
    use HasFactory;

    #[LodataRelationship()]
    public function eightDReport()
    {
        return $this->belongsTo(EightDReport::class);
    }

    #[LodataRelationship()]
    public function responsible()
    {
        return $this->belongsTo(User::class);
    }
}
