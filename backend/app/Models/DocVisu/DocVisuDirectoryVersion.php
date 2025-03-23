<?php

namespace App\Models\DocVisu;

use Illuminate\Database\Eloquent\Model;

class DocVisuDirectoryVersion extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'version',
        'updated_name',
        'type',
        'directory_id',
        'user_id_creator',
    ];
}
