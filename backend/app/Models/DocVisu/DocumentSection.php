<?php

namespace App\Models\DocVisu;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class DocumentSection extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'model_type',
        'custom_id',
        'sort_order',
        'directory_structure_id',
        'name',
    ];


    #[LodataRelationship]
    public function directoryStructure(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DirectoryStructure::class);
    }
    
    #[LodataRelationship]
    public function directoryStructures(): MorphMany
    {
        return $this->morphMany(DirectoryStructure::class, 'sectionable');
    }
}
