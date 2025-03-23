<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;

class Department extends Model
{
    use HasFactory;
    protected $fillable = [
        'custom_id',
        'name',
        'is_active'
    ];

    #[LodataRelationship]
    public function halls()
    {
        return $this->belongsToMany(Hall::class, 'department_hall');
    }
}
