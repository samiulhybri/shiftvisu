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
        Schema::create('offer_pos_shaft_upset_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_pos_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->integer('section');
            $table->double('height');
            $table->double('outer_diameter');
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
        Schema::dropIfExists('offer_pos_shaft_upset_parts');
    }
};
