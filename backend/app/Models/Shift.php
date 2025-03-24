<?php

namespace App\Models;

use App\Enums\DateToConsider;
use Carbon\Carbon;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function shiftModels(): BelongsToMany
    {
        return $this->belongsToMany(ShiftModel::class, "shift_model_shifts")->withPivot("day_of_week");
    }

    #[LodataRelationship]
    public function machineUserTime(): HasMany
    {
        return $this->hasMany(MachineUserTime::class);
    }

    #[LodataRelationship]
    public function shiftModelShifts(): HasMany
    {
        return $this->hasMany(ShiftModelShift::class);
    }

    public function shiftStartEndForDate(Carbon $date): array
    {
        $shiftStart = Carbon::parse($this->shift_start)->setDateFrom($date);
        $shiftEnd = Carbon::parse($this->shift_end)->setDateFrom($date);

        if ($shiftEnd->isBefore($shiftStart)) {
            if ($this->date_to_consider == DateToConsider::SHIFT_START()) {
                $shiftEnd->addDay();
            } else {
                $shiftStart->subDay();
            }
        }
        return [$shiftStart, $shiftEnd];
    }

    #[LodataRelationship]
    public function hasShiftModels(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ShiftModelShift::class);  //Check, is shift associated with any shift model or not
    }
}
