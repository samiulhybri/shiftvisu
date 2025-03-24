<?php

use App\Models\ItemState;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("item_state_halls", function (Blueprint $table) {
            $table->dropForeign('item_state_halls_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained();
        });
        Schema::table("item_state_machines", function (Blueprint $table) {
            $table->dropForeign('item_state_machines_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained();
        });
        Schema::table("stocks", function (Blueprint $table) {
            $table->dropForeign('stocks_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained();
        });
        Schema::table("prod_order_pos_operation_quantities", function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operation_quantities_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("item_state_halls", function (Blueprint $table) {
            $table->dropForeign('item_state_halls_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
        Schema::table("item_state_machines", function (Blueprint $table) {
            $table->dropForeign('item_state_machines_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
        Schema::table("stocks", function (Blueprint $table) {
            $table->dropForeign('stocks_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
        Schema::table("prod_order_pos_operation_quantities", function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operation_quantities_item_state_id_foreign');
            $table->foreignIdFor(ItemState::class)->change()->constrained()->cascadeOnDelete();
        });
    }
};
