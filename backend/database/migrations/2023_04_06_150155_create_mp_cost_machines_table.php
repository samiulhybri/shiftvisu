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
        Schema::create('mp_cost_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mp_cost_id')->constrained();
            $table->foreignId('machine_id')->constrained();
            $table->unique(['mp_cost_id', 'machine_id']);
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
        Schema::dropIfExists('mp_cost_machines');
    }
};
