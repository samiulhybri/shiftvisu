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
        Schema::dropIfExists('material_analysis_melting_types');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('material_analysis_melting_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\MaterialAnalysis::class)->constrained()->cascadeOnDelete();
            $table->string('melting_type');
            $table->index(['material_analysis_id','melting_type'], 'material_analysis_melting_types_id_unique');
            $table->timestamps();
        });
    }
};
