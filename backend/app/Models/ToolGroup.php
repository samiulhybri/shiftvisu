<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ToolGroup extends Model
{
    use HasFactory;

    public function tools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class, "tool_tool_groups");
    }

    public function hall(): BelongsTo
    {
        return $this->belongsTo(Hall::class);
    }
}
