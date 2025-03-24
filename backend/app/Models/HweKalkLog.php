<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;


class HweKalkLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'loggable_id',
        'entity',
        'event',
        'description',
    ];

    #[LodataRelationship]
    public function user(){
        return $this->belongsTo(User::class);
    }

}
