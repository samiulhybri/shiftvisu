<?php

use App\Models\ItemPlant;
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
        Schema::table('inspection_lots', function (Blueprint $table) {
            $table->foreignIdFor(ItemPlant::class)->nullable()->constrained();
            $table->morphs('inspectable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_lots', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ItemPlant::class);
            $table->dropMorphs('inspectable');
        });
    }
};
