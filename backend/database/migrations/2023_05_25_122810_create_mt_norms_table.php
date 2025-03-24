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
        Schema::create('mt_norms', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('specification')->nullable();
            $table->string('revision')->nullable();
            $table->string('test_class')->nullable();
            $table->string('testing_facility')->nullable();
            $table->string('test_equipment')->nullable();
            $table->string('uv_lamp')->nullable();
            $table->string('test_range')->nullable();
            $table->double('magnetization')->nullable();
            $table->double('current_type')->nullable();
            $table->double('illuminance')->nullable();
            $table->double('irradiance')->nullable();
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
        Schema::dropIfExists('mt_norms');
    }
};
