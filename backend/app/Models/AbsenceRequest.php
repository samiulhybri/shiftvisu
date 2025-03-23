<?php

namespace App\Models;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbsenceRequest extends Model {
    use HasFactory;

    #[LodataRelationship]
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo {
        return $this->belongsTo(User::class);
    }

    #[LodataRelationship]
    public function absenceType(): \Illuminate\Database\Eloquent\Relations\BelongsTo {
        return $this->belongsTo(AbsenceType::class);
    }

    #[LodataRelationship]
    public function approvedBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
