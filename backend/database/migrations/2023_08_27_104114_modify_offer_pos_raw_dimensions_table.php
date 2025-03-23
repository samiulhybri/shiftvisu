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
            $table->string('semi_finished_product_type')->nullable();
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
            $table->dropColumn('semi_finished_product_type');
        });
    }
};
