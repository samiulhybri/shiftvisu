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
        Schema::create('operation_plan_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operation_plan_id')->constrained()->cascadeOnDelete();
            $table->string('pos');
            $table->unique(['operation_plan_id', 'pos']);

            $table->string('name');
            $table->double('te')->default(0);
            $table->double('tr')->default(0);

            $table->foreignId('machine_id')->nullable()->constrained()->nullOnDelete();
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
        Schema::dropIfExists('operation_plan_pos');
    }
};
