<?php

namespace App\Models;

use App\Enums\DateToConsider;
use Carbon\Carbon;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Capacity extends Model
{
    use HasFactory;

    protected $guarded = [];

    #[LodataRelationship]
    public function machine(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function shift(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    public function capacitable(): MorphTo
    {
        return $this->morphTo();
    }

    public function startDateTime(): Carbon
    {
        $timeZone = config('app.timezone');
        $dateTime = Carbon::parse($this->start_time, $timeZone ?? env('APP_TIME_ZONE'))
            ->setDateFrom($this->date);

        if ($this->date_to_consider == DateToConsider::SHIFT_END() && $this->end_time < $this->start_time) {
            $dateTime->subDay();
        }

        return $dateTime;
    }

    public function endDateTime(): Carbon
    {
        $timeZone = config('app.timezone');
        $dateTime = Carbon::parse($this->end_time, $timeZone ?? env('APP_TIME_ZONE'))
            ->setDateFrom($this->date);

        if ($this->date_to_consider == DateToConsider::SHIFT_START() && $this->end_time < $this->start_time) {
            $dateTime->addDay();
        }

        return $dateTime;
    }

    #[LodataRelationship]
    public function machineUserPlanTimes()
    {
        return $this->hasMany(MachineUserPlanTime::class);
    }
}
