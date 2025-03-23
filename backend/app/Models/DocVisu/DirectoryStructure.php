<?php

namespace App\Models\DocVisu;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class DirectoryStructure extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sectionable_type',
        'sectionable_id',
        'custom_id',
        'is_active',
        'name',
    ];

    public function directories(): HasMany
    {
        return $this->hasMany(DocVisuDirectory::class, 'parent_id');
    }

    public function links(): HasMany
    {
        return $this->hasMany(DocVisuLinking::class, 'parent_id');
    }

    #[LodataRelationship]
    public function documentSection(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DocumentSection::class);
    }
}
