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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropColumn([
                "outer_diameter_raw",
                "side_a_raw",
                "inner_diameter_raw",
                "height_raw",
                "length_raw",
                "side_b_raw",
                "outer_diameter_disk_punched",
                "inner_diameter_pre_1",
                "height_pre_1",
                "inner_diameter_pre_2",
                "height_pre_2"
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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->double('outer_diameter_raw')->nullable();
            $table->double('side_a_raw')->nullable();
            $table->double('inner_diameter_raw')->nullable();
            $table->double('height_raw')->nullable();
            $table->double('length_raw')->nullable();
            $table->double('side_b_raw')->nullable();
            $table->double('outer_diameter_disk_punched')->nullable();
            $table->double('inner_diameter_pre_1')->nullable();
            $table->double('height_pre_1')->nullable();
            $table->double('inner_diameter_pre_2')->nullable();
            $table->double('height_pre_2')->nullable();
        });
    }
};
