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
        Schema::create('prod_order_pos_op_plan_pos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('prod_order_pos_id')->constrained()->cascadeOnDelete();
            $table->string('pos');
            $table->unique(['prod_order_pos_id', 'pos']);

            $table->string('name');
            $table->dateTime('start')->nullable();
            $table->dateTime('end')->nullable();
            $table->double('te')->default(0);
            $table->double('tr')->default(0);
            $table->integer('cavity')->default(1);

            $table->foreignId('machine_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tool_id')->nullable()->constrained()->nullOnDelete();


            $table->integer('registered_quantity');

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
        Schema::dropIfExists('prod_order_pos_op_plan_pos');
    }
};
