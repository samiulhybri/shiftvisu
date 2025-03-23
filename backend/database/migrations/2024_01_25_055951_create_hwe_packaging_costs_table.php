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
        Schema::create('hwe_packaging_costs', function (Blueprint $table) {
            $table->id();
            $table->double('outer_diameter_min')->nullable();
            $table->double('outer_diameter_max')->nullable();
            $table->double('height_min')->nullable();
            $table->double('height_max')->nullable();
            $table->double('weight_min')->nullable();
            $table->double('weight_max')->nullable();
            $table->double('quantity_min')->nullable();
            $table->double('quantity_max')->nullable();
            $table->double('cost')->nullable();
            $table->string('packaging_cost_unit')->nullable();
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
        Schema::dropIfExists('hwe_packaging_costs');
    }
};
