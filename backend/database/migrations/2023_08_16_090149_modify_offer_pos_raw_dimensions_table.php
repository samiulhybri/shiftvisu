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
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->double('gross_weight')->nullable();
            $table->double('operating_weight')->nullable();
            $table->double('basismaterial')->nullable();
            $table->double('semi_finished_product')->nullable();
            $table->double('deformation')->nullable();
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
                "gross_weight",
                "operating_weight",
                "basismaterial",
                "semi_finished_product",
                "deformation"
            ]);
        });
    }
};
