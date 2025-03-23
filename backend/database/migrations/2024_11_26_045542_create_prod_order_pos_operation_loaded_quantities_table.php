<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prod_order_pos_operation_loaded_quantities', function (Blueprint $table) {
            $table->id();

            // Manually define foreign keys for the prod_order_pos_operation_id
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'loaded_quantities_prod_order_pos_op_id_foreign')
                  ->references('id')
                  ->on('prod_order_pos_operations')
                  ->onDelete('cascade');
            
            // Manually define foreign keys for the machine_id
            $table->unsignedBigInteger('machine_id');
            $table->foreign('machine_id', 'loaded_quantities_machine_id_foreign')
                  ->references('id')
                  ->on('machines')
                  ->onDelete('cascade');

            $table->double('quantity')->default(0);
            $table->dateTime('date')->useCurrent();

            // Manually define foreign keys for the user_id
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id', 'loaded_quantities_user_id_foreign')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');

            $table->boolean('is_unloaded')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_order_pos_operation_loaded_quantities');
    }
};
