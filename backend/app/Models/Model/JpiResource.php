<?php

namespace App\Models\Model;

use App\Models\JpiCalendarException;
use App\Models\JpiWorkTimePerWeekday;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JpiResource extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function jpiResourceGroup(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(JpiResourceGroup::class, 'jpi_resource_resource_groups');
    }

    public function workTimePerWeekdays(): HasMany
    {
        return $this->hasMany(JpiWorkTimePerWeekday::class);
    }

    public function calendarExceptions(): HasMany
    {
        return $this->hasMany(JpiCalendarException::class);
    }
}
