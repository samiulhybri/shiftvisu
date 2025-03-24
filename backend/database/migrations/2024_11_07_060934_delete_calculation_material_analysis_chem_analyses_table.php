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
        Schema::dropIfExists('calculation_material_analysis_chem_analyses');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('calculation_material_analysis_chem_analyses', function (Blueprint $table) {
            $table->unsignedBigInteger('calculation_material_analysis_id')->nullable();
            $table->foreign('calculation_material_analysis_id', 'calculation_material_analysis_chem_analyses_calc_mat_id')->references('id')->on('calculation_material_analyses')->cascadeOnDelete();

            $table->unsignedBigInteger('calculation_chemical_analysis_id')->nullable();
            $table->foreign('calculation_chemical_analysis_id', 'calculation_material_analysis_chem_analyses_calc_chem_id')->references('id')->on('calculation_chemical_analyses')->cascadeOnDelete();
        });
    }
};
