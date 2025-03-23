<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ProdOrder extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custom_id',
        'operation_plan_id',
        'machine_id',
        'item_id',
        'tool_id',
        'start',
        'end',
        'quantity',
        'te',
        'tr',
        'cavity',
        'order_type'
    ];

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function item()
    {
        return $this->hasManyThrough(ProdOrderPos::class, Item::class);
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    #[LodataRelationship]
    public function prodOrderPos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProdOrderPos::class);
    }

    public function classifications(): MorphMany
    {
        return $this->morphMany(Classification::class, 'model');
    }

    #[LodataRelationship]
    public function plantProduction(): BelongsTo
    {
        return $this->belongsTo(Plant::class, 'plant_id_production');
    }

    #[LodataRelationship]
    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }
    #[LodataRelationship]
    public function callOff(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(CallOff::class);
    }
}
