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
        Schema::create('sim_call_offs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('call_off_simulation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->date('date_monday');
            $table->unsignedInteger('year');
            $table->unsignedInteger('week');
            $table->unique(['call_off_simulation_id', 'item_id', 'year', 'week']);
            $table->double('quantity');
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
        Schema::dropIfExists('sim_call_offs');
    }
};
