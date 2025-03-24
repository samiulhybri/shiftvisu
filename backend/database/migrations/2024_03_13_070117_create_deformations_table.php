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
        Schema::create('deformations', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('continuous_casting')->nullable();
            $table->string('ingot_casting')->nullable();
            $table->string('deformation')->nullable();
            $table->string('stretch_forging_degree')->nullable();
            $table->string('note')->nullable();
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
        Schema::dropIfExists('deformations');
    }
};
