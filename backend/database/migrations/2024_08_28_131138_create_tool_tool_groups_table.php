<?php

use App\Models\Tool;
use App\Models\ToolGroup;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tool_tool_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Tool::class)->constrained();
            $table->foreignIdFor(ToolGroup::class)->constrained();
            $table->timestamps();

            $table->unique(['tool_id', 'tool_group_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_tool_groups');
    }
};
