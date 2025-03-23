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
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->double('outer_diameter_pre_1')->nullable();
            $table->double('outer_diameter_pre_2')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropColumn([
                'outer_diameter_pre_1',
                'outer_diameter_pre_2'
            ]);
        });
    }
};
