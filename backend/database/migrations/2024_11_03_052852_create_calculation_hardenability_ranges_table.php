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
    public function up(): void
    {
        Schema::create('calculation_hardenability_ranges', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Calculation::class)->unique()->constrained()->cascadeOnDelete();
            $table->string('with_applicable_standard')->nullable();
            $table->string('note')->nullable();
            $table->string('jominy_batch')->nullable();
            $table->double('value_1_5_min')->nullable();
            $table->double('value_1_5_max')->nullable();
            $table->double('value_3_min')->nullable();
            $table->double('value_3_max')->nullable();
            $table->double('value_5_min')->nullable();
            $table->double('value_5_max')->nullable();
            $table->double('value_7_min')->nullable();
            $table->double('value_7_max')->nullable();
            $table->double('value_9_min')->nullable();
            $table->double('value_9_max')->nullable();
            $table->double('value_10_min')->nullable();
            $table->double('value_10_max')->nullable();
            $table->double('value_11_min')->nullable();
            $table->double('value_11_max')->nullable();
            $table->double('value_13_min')->nullable();
            $table->double('value_13_max')->nullable();
            $table->double('value_15_min')->nullable();
            $table->double('value_15_max')->nullable();
            $table->double('value_20_min')->nullable();
            $table->double('value_20_max')->nullable();
            $table->double('value_25_min')->nullable();
            $table->double('value_25_max')->nullable();
            $table->double('value_30_min')->nullable();
            $table->double('value_30_max')->nullable();
            $table->double('value_35_min')->nullable();
            $table->double('value_35_max')->nullable();
            $table->double('value_40_min')->nullable();
            $table->double('value_40_max')->nullable();
            $table->double('value_45_min')->nullable();
            $table->double('value_45_max')->nullable();
            $table->double('value_50_min')->nullable();
            $table->double('value_50_max')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculation_hardenability_ranges');
    }
};
