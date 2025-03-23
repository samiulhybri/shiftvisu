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
            $table->string('customer_material_number')->nullable();
            $table->string('delivery_state')->nullable();
            $table->string('outer_diameter_surface_final')->nullable();
            $table->string('side_a_surface_final')->nullable();
            $table->string('side_b_surface_final')->nullable();
            $table->string('inner_diameter_surface_final')->nullable();
            $table->string('height_surface_final')->nullable();
            $table->string('length_surface_final')->nullable();
            $table->dropColumn([
                "outer_diameter",
                "inner_diameter",
                "height",
                "offset_number"
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
            $table->integer('outer_diameter')->nullable();
            $table->integer('inner_diameter')->nullable();
            $table->integer('height')->nullable();
            $table->integer('offset_number')->nullable();
            $table->dropColumn([
                "customer_material_number",
                "delivery_state",
                "outer_diameter_surface_final",
                "side_a_surface_final",
                "side_b_surface_final",
                "inner_diameter_surface_final",
                "height_surface_final",
                "length_surface_final"
            ]);
        });
    }
};
