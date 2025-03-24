<?php

namespace App\Models\DocVisu;

use App\Models\User;
use Flat3\Lodata\Attributes\LodataRelationship;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FileVersion extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'version',
        'media_file_id',
        'updated_name',
        'type',
        'doc_visu_file_id',
        'user_id_creator',
    ];
    
    #[LodataRelationship]
    public function file(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(DocVisuFile::class);
    }
    
    #[LodataRelationship]
    public function creator(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_creator');
    }
}
