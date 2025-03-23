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
        Schema::create('calculation_heat_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calculation_id')->constrained()->cascadeOnDelete();
            $table->integer('pos');
            $table->string('type');
            $table->unique(['calculation_id', 'pos', 'type']);
            $table->double('hardness')->nullable();
            $table->double('temperature_min')->nullable();
            $table->double('temperature_max')->nullable();
            $table->double('annealing_temperature')->nullable();
            $table->string('internal_note');
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
        Schema::dropIfExists('calculation_heat_treatments');
    }
};
