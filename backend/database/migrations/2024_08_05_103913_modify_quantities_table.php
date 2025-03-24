<?php

use App\Models\ProdOrderPosOperationQuantity;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos_operation_quantities', function (Blueprint $table) {
            $table->foreignIdFor(
                ProdOrderPosOperationQuantity::class,
                'prod_order_pos_operation_quantity_id_canceled',
            )
                ->nullable()
                ->unique("prod_order_pos_operation_quantities_canceled_unique")
                ->constrained(indexName: "prod_order_pos_operation_quantities_canceled_foreign");

            $table->boolean("is_final_quantity")->default(false);
            $table->string("custom_id")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_quantities', function (Blueprint $table) {
            $table->dropForeign("prod_order_pos_operation_quantities_canceled_foreign");
            $table->dropUnique("prod_order_pos_operation_quantities_canceled_unique");
            $table->dropColumn("prod_order_pos_operation_quantity_id_canceled");
            $table->dropColumn("is_final_quantity");
            $table->dropColumn("custom_id");
        });
    }
};
