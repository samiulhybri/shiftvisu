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
        Schema::create('jpi_task_predecessors', function (Blueprint $table) {
            $table->foreignId('jpi_task_id')->constrained()->cascadeOnDelete();
            $table->foreignId('predecessor_jpi_task_id')->references('id')->on('jpi_tasks')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jpi_task_predecessors');
    }
};
