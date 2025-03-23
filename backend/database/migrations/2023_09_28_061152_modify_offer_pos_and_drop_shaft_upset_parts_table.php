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
        Schema::dropIfExists('offer_pos_shaft_upset_parts');
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->double('total_length')->nullable();
            $table->double('max_outer_diameter')->nullable();
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
            $table->dropColumn(['total_length','max_outer_diameter']);
        });
    }
};
