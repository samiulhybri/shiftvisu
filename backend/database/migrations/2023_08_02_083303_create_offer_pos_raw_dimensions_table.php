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
        Schema::create('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_pos_id')->constrained()->cascadeOnDelete();
            $table->double('outer_diameter')->nullable();
            $table->double('side_a')->nullable();
            $table->double('inner_diameter')->nullable();
            $table->double('height')->nullable();
            $table->double('length')->nullable();
            $table->double('side_b')->nullable();
            $table->double('outer_diameter_disk_punched')->nullable();
            $table->double('inner_diameter_pre_1')->nullable();
            $table->double('height_pre_1')->nullable();
            $table->double('inner_diameter_pre_2')->nullable();
            $table->double('height_pre_2')->nullable();
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
        Schema::dropIfExists('offer_pos_raw_dimensions');
    }
};
