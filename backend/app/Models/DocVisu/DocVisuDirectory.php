<?php

namespace App\Models\DocVisu;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class DocVisuDirectory extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'parent_type',
        'parent_id',
        'name',
    ];

    #[LodataRelationship]
    public function links(): MorphMany
    {
        return $this->morphMany(DocVisuLinking::class, 'parent');
    }

    public function files()
    {
        return $this->morphMany(DocVisuFile::class, 'parent');
    }
    
    public function directories(): HasMany
    {
        return $this->hasMany(DocVisuDirectory::class, 'parent_id');
    }

    public function parent(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }
}
