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
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->double("pre_punching_1")->nullable();
            $table->double("pre_punching_2")->nullable();
            $table->double("pre_punching_3")->nullable();
            $table->double("rolling_pin_1")->nullable();
            $table->double("rolling_pin_2")->nullable();
            $table->double("rolling_length")->nullable();
            $table->string("rollback")->nullable();
            $table->double("excess_total_length")->nullable();
            $table->double("stretching_path")->nullable();
            $table->double("rollweg")->nullable();
            $table->string("outer_end")->nullable();
            $table->double("outer_diameter_pre_1_warm")->nullable();
            $table->double("outer_diameter_pre_2_warm")->nullable();
            $table->double("inner_diameter_pre_1_warm")->nullable();
            $table->double("inner_diameter_pre_2_warm")->nullable();
            $table->double("height_pre_1_warm")->nullable();
            $table->double("height_pre_2_warm")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropColumn([
                'pre_punching_1',
                'pre_punching_2',
                'pre_punching_3',
                'rolling_pin_1',
                'rolling_pin_2',
                'rolling_length',
                'rollback',
                'excess_total_length',
                'stretching_path',
                'rollweg',
                'outer_end',
                'outer_diameter_pre_1_warm',
                'outer_diameter_pre_2_warm',
                'inner_diameter_pre_1_warm',
                'inner_diameter_pre_2_warm',
                'height_pre_1_warm',
                'height_pre_2_warm'
            ]);
        });
    }
};
