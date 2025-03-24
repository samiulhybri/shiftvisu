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
        Schema::table('calculations', function (Blueprint $table) {
            $table->dropColumn([
                'tensile_test_rt',
                'reh_min',
                'reh_max',
                'rp_min',
                'rp_max',
                'rm_min',
                'rm_max',
                'a5_min',
                'a5_max',
                'a4_min',
                'a4_max',
                'z_min',
                'z_max',
                'tensile_test_warm',
                'temperature',
                'rp_min_warm',
                'rm_min_warm',
                'impact_test',
                'impact_test_type',
                'impact_temperature_1',
                'impact_temperature_2',
                'impact_single_1',
                'impact_avg_1',
                'impact_single_2',
                'impact_avg_2',
                'hardness_test',
                'hbw_min',
                'hbw_max',
                'mpa_min_piece',
                'mpa_max_piece',
                'mpa_min_specimen',
                'mpa_max_specimen',
                'hardness_test_type',
                'hardness_min',
                'hardness_max',
                'bending_test',
                'iso_7438',
                'astm_a370'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculations', function (Blueprint $table) {
            $table->boolean('tensile_test_rt')->default(false);
            $table->double('reh_min')->nullable();
            $table->double('reh_max')->nullable();
            $table->double('rp_min')->nullable();
            $table->double('rp_max')->nullable();
            $table->double('rm_min')->nullable();
            $table->double('rm_max')->nullable();
            $table->double('a5_min')->nullable();
            $table->double('a5_max')->nullable();
            $table->double('a4_min')->nullable();
            $table->double('a4_max')->nullable();
            $table->double('z_min')->nullable();
            $table->double('z_max')->nullable();
            $table->boolean('tensile_test_warm')->default(false);
            $table->double('temperature')->nullable();
            $table->double('rp_min_warm')->nullable();
            $table->double('rm_min_warm')->nullable();
            $table->boolean('impact_test')->default(false);
            $table->string('impact_test_type')->nullable();
            $table->double('impact_temperature_1')->nullable();
            $table->double('impact_temperature_2')->nullable();
            $table->double('impact_single_1')->nullable();
            $table->double('impact_avg_1')->nullable();
            $table->double('impact_single_2')->nullable();
            $table->double('impact_avg_2')->nullable();
            $table->boolean('hardness_test')->default(false);
            $table->double('hbw_min')->nullable();
            $table->double('hbw_max')->nullable();
            $table->double('mpa_min_piece')->nullable();
            $table->double('mpa_max_piece')->nullable();
            $table->double('mpa_min_specimen')->nullable();
            $table->double('mpa_max_specimen')->nullable();
            $table->string('hardness_test_type')->nullable();
            $table->double('hardness_min')->nullable();
            $table->double('hardness_max')->nullable();
            $table->boolean('bending_test')->default(false);
            $table->boolean('iso_7438')->default(false);
            $table->boolean('astm_a370')->default(false);
        });
    }
};
