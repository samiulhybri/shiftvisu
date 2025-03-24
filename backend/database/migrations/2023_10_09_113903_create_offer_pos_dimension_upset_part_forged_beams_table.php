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
        Schema::create('offer_pos_dimension_upset_part_forged_beams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('offer_pos_raw_dimension_id');
            $table->string('type')->nullable();
            $table->integer('section')->nullable();
            $table->double('length')->nullable();
            $table->double('outer_diameter')->nullable();
            $table->timestamps();

            $table->foreign('offer_pos_raw_dimension_id','offer_pos_raw_dimension_id_forged_beams_foreign')->references('id')->on('offer_pos_raw_dimensions')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('offer_pos_dimension_upset_part_forged_beams');
    }
};
