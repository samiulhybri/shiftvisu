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
        Schema::table('prod_order_pos_operation_handling_units', function (Blueprint $table) {
            // Drop the foreign key constraint before modifying the column
            $table->dropForeign('prod_order_pos_operation_id_foreign_for_operation_handling_units');

            // Make the column nullable
            $table->unsignedBigInteger('prod_order_pos_operation_id')->nullable()->change();

            // Re-add the foreign key constraint with cascade on delete
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_handling_units')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_handling_units', function (Blueprint $table) {
            // Drop the updated foreign key
            $table->dropForeign('prod_order_pos_operation_id_foreign_for_operation_handling_units');

            // Revert the column to non-nullable
            $table->unsignedBigInteger('prod_order_pos_operation_id')->nullable(false)->change();

            // Re-add the original foreign key constraint
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_handling_units')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
        });
    }
};
