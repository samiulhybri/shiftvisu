<?php

namespace App\Models\DocVisu;

use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocVisuLinking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'parent_id',
        'parent_type',
        'linkable_id',
        'linkable_type',
    ];

    #[LodataRelationship]
    public function parentStructure(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DirectoryStructure::class);
    }

    #[LodataRelationship]
    public function parentDirectory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DocVisuDirectory::class);
    }

    #[LodataRelationship]
    public function structure(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DirectoryStructure::class, 'linkable_id');
    }  

    #[LodataRelationship]
    public function directory(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DocVisuDirectory::class, 'linkable_id');
    }  

    #[LodataRelationship]
    public function file(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DocVisuFile::class, 'linkable_id');
    } 

    public function parent(): MorphTo
    {
        return $this->morphTo();
    }

    public function linkable(): MorphTo
    {
        return $this->morphTo();
    }
}
