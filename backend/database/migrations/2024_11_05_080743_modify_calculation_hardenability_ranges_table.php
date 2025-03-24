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
        Schema::table('calculation_hardenability_ranges', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\HardenabilityRange::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\Material::class)->nullable()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_hardenability_ranges', function (Blueprint $table) {
            $table->dropConstrainedForeignId('hardenability_range_id');
            $table->dropConstrainedForeignId('material_id');
        });
    }
};
