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
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shift_model_id')->constrained()->cascadeOnDelete();
            $table->string('custom_id')->unique();
            $table->string('name');
            $table->time('start_time');
            $table->time('end_time');
            $table->double('hours')->default(0);
            $table->boolean('is_capacity_relevant');
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
        Schema::dropIfExists('shifts');
    }
};
