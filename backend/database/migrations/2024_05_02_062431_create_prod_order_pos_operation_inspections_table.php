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
        Schema::create('prod_order_pos_operation_inspections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_inspections')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
            $table->string('inspection');
            $table->string('name')->nullable();
            $table->string('frequency')->default('OPERATION_START');
            $table->double('time_interval')->nullable();
            $table->double('quantity_interval')->nullable();
            $table->unique('prod_order_pos_operation_id', 'inspection');
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
        Schema::dropIfExists('prod_order_pos_operation_inspections');
    }
};
