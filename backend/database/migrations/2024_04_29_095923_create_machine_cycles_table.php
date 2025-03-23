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
        Schema::create('machine_cycles', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Machine::class)->constrained()->cascadeOnDelete();
            $table->dateTime('registered_datetime');
            $table->integer('quantity')->default(1);
            $table->string('type');
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
        Schema::dropIfExists('machine_cycles');
    }
};
