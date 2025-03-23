<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('material_analysis_chem_analyses', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\MaterialAnalysis::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\ChemAnalysis::class)->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('material_analysis_chem_analyses');
    }
};
