<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->dropColumn([
                'j_1_5_min',
                'j_1_5_max',
                'j_3_min',
                'j_3_max',
                'j_5_min',
                'j_5_max',
                'j_7_min',
                'j_7_max',
                'j_9_min',
                'j_9_max',
                'j_10_min',
                'j_10_max',
                'j_11_min',
                'j_11_max',
                'j_13_min',
                'j_13_max',
                'j_15_min',
                'j_15_max',
                'j_20_min',
                'j_20_max',
                'j_25_min',
                'j_25_max',
                'j_30_min',
                'j_30_max',
                'j_35_min',
                'j_35_max',
                'j_40_min',
                'j_40_max',
                'j_45_min',
                'j_45_max',
                'j_50_min',
                'j_50_max',
                'rp_0_2_max',
                'regulation'
            ]);
            $table->double('impact_energy_av')->nullable();
            $table->double('setpoint_hot_tensile_test')->nullable();
            $table->string('sample_depth')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('testing_scopes', function (Blueprint $table) {
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
            $table->double('rp_0_2_max')->nullable();
            $table->dropColumn('impact_energy_av');
            $table->dropColumn('setpoint_hot_tensile_test');
            $table->dropColumn('sample_depth');
            $table->string('regulation')->nullable();
        });
    }
};
