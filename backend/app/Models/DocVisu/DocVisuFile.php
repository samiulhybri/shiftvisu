<?php

namespace App\Models\DocVisu;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class DocVisuFile extends Model implements HasMedia
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custom_id',
        'parent_id',
        'parent_type',
    ];

    use InteractsWithMedia {
        media as protected trait_media;
    }
        
    #[LodataRelationship]
    public function directory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DocVisuDirectory::class);
    }

    #[LodataRelationship]
    public function media(): MorphMany
    {
        return $this->trait_media();
    }

    #[LodataRelationship]
    public function versions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FileVersion::class);
    }

    #[LodataRelationship]
    public function notes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(FileNote::class);
    }
}
