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
        Schema::table('machine_prod_order_pos_operation_times', function (Blueprint $table) {
            // Add nullable foreign key for packaging_instruction_id with a custom constraint name
            $table->unsignedBigInteger('packaging_instruction_id')->nullable();
            $table->foreign('packaging_instruction_id', 'mpo_packaging_instruction_id_foreign') // Custom name
                  ->references('id')->on('packaging_instructions');

            // Add nullable foreign key for item_id_packaging with a custom constraint name
            $table->unsignedBigInteger('item_id_packaging')->nullable();
            $table->foreign('item_id_packaging', 'mpo_item_id_packaging_foreign')  // Custom name
                  ->references('id')->on('items');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_prod_order_pos_operation_times', function (Blueprint $table) {
            // Drop the foreign key and column for packaging_instruction_id
            $table->dropForeign('mpo_packaging_instruction_id_foreign');
            $table->dropColumn('packaging_instruction_id');

            // Drop the foreign key and column for item_id_packaging
            $table->dropForeign('mpo_item_id_packaging_foreign');
            $table->dropColumn('item_id_packaging');
        });
    }
};
