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
        Schema::create('hwe_ring_rolling_factors', function (Blueprint $table) {
            $table->id();
            $table->double('weight_from')->nullable();
            $table->double('weight_to')->nullable();
            $table->double('factor')->nullable();
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
        Schema::dropIfExists('hwe_ring_rolling_factors');
    }
};
