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
            $table->integer('stretching_pin_value')->nullable();
            $table->integer('rolling_pin_value')->nullable();
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
            $table->dropColumn(['stretching_pin_value','rolling_pin_value']);
        });
    }
};
