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
        Schema::table('calculation_chemical_analyses', function (Blueprint $table) {

            $table->unsignedBigInteger('calculation_material_analysis_id')->nullable();
            $table->foreign('calculation_material_analysis_id', 'calculation_chemical_analyses_cma_frn')->references('id')->on('calculation_material_analyses')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_chemical_analyses', function (Blueprint $table) {
            $table->dropForeign('calculation_chemical_analyses_cma_frn');
            $table->dropColumn('calculation_material_analysis_id');
        });
    }
};
