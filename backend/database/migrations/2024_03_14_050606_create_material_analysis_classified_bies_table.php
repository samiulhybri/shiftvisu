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
        Schema::create('material_analysis_classified_bies', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\MaterialAnalysis::class)->constrained()->cascadeOnDelete();
            $table->string('classified_by');
            $table->index(['material_analysis_id','classified_by'], 'material_analysis_classified_bies_id_unique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('material_analysis_classified_bies');
    }
};
