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
        Schema::create('mt_specs', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->boolean('tensile_test_rt')->default(false);
            $table->double('reh_min')->nullable();
            $table->double('reh_max')->nullable();
            $table->double('rp_min')->nullable();
            $table->double('rp_max')->nullable();
            $table->double('rm_min')->nullable();
            $table->double('rm_max')->nullable();
            $table->double('a5_min')->nullable();
            $table->double('a4_min')->nullable();
            $table->double('z_min')->nullable();
            $table->double('rp_rm_ratio')->nullable();
            $table->string('text_tensile_test')->nullable();
            $table->boolean('tensile_test_warm')->default(false);
            $table->double('temperature')->nullable();
            $table->double('rp_min_warm')->nullable();
            $table->double('rm_min_warm')->nullable();
            $table->double('a_min_warm')->nullable();
            $table->double('z_min_warm')->nullable();
            $table->boolean('impact_test')->default(false);
            $table->string('impact_test_type')->nullable();
            $table->double('impact_temperature_1')->nullable();
            $table->double('impact_temperature_2')->nullable();
            $table->double('impact_single_1')->nullable();
            $table->double('impact_avg_1')->nullable();
            $table->double('impact_single_2')->nullable();
            $table->double('impact_avg_2')->nullable();
            $table->double('hbw_min')->nullable();
            $table->double('hbw_max')->nullable();
            $table->double('mpa_min_piece')->nullable();
            $table->double('mpa_max_piece')->nullable();
            $table->double('mpa_min_specimen')->nullable();
            $table->double('mpa_max_specimen')->nullable();
            $table->boolean('hardness_test')->default(false);
            $table->string('hardness_conversion')->nullable();
            $table->string('hardness_test_type')->nullable();
            $table->string('hardness_localisation')->nullable();
            $table->double('hardness_min')->nullable();
            $table->double('hardness_max')->nullable();
            $table->boolean('bending_test')->default(false);
            $table->boolean('iso_7438')->default(false);
            $table->boolean('astm_a370')->default(false);
            $table->boolean('jominy_test')->default(false);
            $table->string('jominy_specification')->nullable();
            $table->double('j_1_5_min')->nullable();
            $table->double('j_1_5_max')->nullable();
            $table->double('j_3_min')->nullable();
            $table->double('j_3_max')->nullable();
            $table->double('j_5_min')->nullable();
            $table->double('j_5_max')->nullable();
            $table->double('j_7_min')->nullable();
            $table->double('j_7_max')->nullable();
            $table->double('j_9_min')->nullable();
            $table->double('j_9_max')->nullable();
            $table->double('j_10_min')->nullable();
            $table->double('j_10_max')->nullable();
            $table->double('j_11_min')->nullable();
            $table->double('j_11_max')->nullable();
            $table->double('j_13_min')->nullable();
            $table->double('j_13_max')->nullable();
            $table->double('j_15_min')->nullable();
            $table->double('j_15_max')->nullable();
            $table->double('j_20_min')->nullable();
            $table->double('j_20_max')->nullable();
            $table->double('j_25_min')->nullable();
            $table->double('j_25_max')->nullable();
            $table->double('j_30_min')->nullable();
            $table->double('j_30_max')->nullable();
            $table->double('j_35_min')->nullable();
            $table->double('j_35_max')->nullable();
            $table->double('j_40_min')->nullable();
            $table->double('j_40_max')->nullable();
            $table->double('j_45_min')->nullable();
            $table->double('j_45_max')->nullable();
            $table->double('j_50_min')->nullable();
            $table->double('j_50_max')->nullable();
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
        Schema::dropIfExists('mt_specs');
    }
};
