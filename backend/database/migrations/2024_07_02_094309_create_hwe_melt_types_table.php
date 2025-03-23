<?php

use App\Models\HweMeltAnalysis;
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
        Schema::create('hwe_melt_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HweMeltAnalysis::class)->constrained()->cascadeOnDelete();
            $table->string('melt_type');
            $table->unique(['melt_type', 'hwe_melt_analysis_id']);
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
        Schema::dropIfExists('hwe_melt_types');
    }
};
