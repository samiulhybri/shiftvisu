<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tool extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'custom_id',
        'name',
        'is_active',
    ];

    public function toolGroups(): BelongsToMany
    {
        return $this->belongsToMany(ToolGroup::class, "tool_tool_groups");
    }
}
