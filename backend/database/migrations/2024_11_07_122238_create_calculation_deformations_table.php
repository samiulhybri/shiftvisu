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
        Schema::create('calculation_deformations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Calculation::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\Deformation::class)->nullable()->constrained()->cascadeOnDelete();
            $table->string('custom_id')->unique();
            $table->string('continuous_casting')->nullable();
            $table->string('ingot_casting')->nullable();
            $table->string('stretch_forging_degree')->nullable();
            $table->string('note')->nullable();
            $table->double('deformation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculation_deformations');
    }
};
