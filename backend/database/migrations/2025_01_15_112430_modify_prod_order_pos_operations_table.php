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
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->bigInteger('item_id_tool')->unsigned()->nullable();
            $table->foreign('item_id_tool')->references('id')->on('items')->nullOnDelete();

            $table->bigInteger('item_id_tool_insert')->unsigned()->nullable();
            $table->foreign('item_id_tool_insert')->references('id')->on('items')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operations_item_id_tool_foreign');
            $table->dropColumn('item_id_tool');

            $table->dropForeign('prod_order_pos_operations_item_id_tool_insert_foreign');
            $table->dropColumn('item_id_tool_insert');
        });
    }
};
