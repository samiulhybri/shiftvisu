<?php

use App\Models\HweMeltAnalysis;
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
        Schema::dropIfExists('hwe_melt_types');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('hwe_melt_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HweMeltAnalysis::class)->constrained()->cascadeOnDelete();
            $table->string('melt_type');
            $table->unique(['melt_type', 'hwe_melt_analysis_id']);
            $table->timestamps();
        });
    }
};
