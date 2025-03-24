<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->boolean('has_forged_drilling')->default(false);
            $table->boolean('is_extruded')->default(false);
            $table->boolean('is_hollow_punching')->default(false);
            $table->foreignIdFor(\App\Models\Tool::class, 'tool_id_2')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(\App\Models\Tool::class, 'tool_id_3')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropColumn(['has_forged_drilling','is_extruded','is_hollow_punching']);
            $table->dropConstrainedForeignIdFor(\App\Models\Tool::class,'tool_id_2');
            $table->dropConstrainedForeignIdFor(\App\Models\Tool::class,'tool_id_3');
        });
    }
};
