<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Qualification extends Model
{
    use HasFactory;

    protected $guarded = [];
    #[LodataRelationship]
    public function item(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    #[LodataRelationship]
    public function machine(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    #[LodataRelationship]
    public function qualificationUsers(): HasMany
    {
        return $this->hasMany(QualificationUser::class);
    }

    public function qualifiedUsers(): HasMany
    {
        return $this->qualificationUsers()
            ->where('qualification_users.is_suspended', false)
            ->where(function ($query) {
                $query->where(function ($query) {
                    $query->where('qualification_users.total_hours', '>=', $this->min_qualification_hours)
                        ->where('qualification_users.total_operations', '>=', $this->min_qualification_operations);
                })->orWhere(function ($query) {
                    $query->where('qualification_users.is_prequalified', true);
                });
            });
    }


    #[LodataRelationship]
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'qualification_users');
    }

    public function requiredForOperationsIgnoreMachineBuilder(): Builder
    {
        $query = ProdOrderPosOperation::query();
        if ($this->machine_id) {
            $query->where('machine_id', $this->machine_id);
        }
        if ($this->operation_code) {
            $query->where('operation_code', $this->operation_code);
        }
        if ($this->item_id) {
            $query->whereHas('prodOrderPos', function ($query) {
                $query->where('item_id', $this->item_id);
            });
        }
        return $query;
    }

}
