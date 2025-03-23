<?php

use App\Models\ProdOrderPosOperationConfirmation;
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
        Schema::table('prod_order_pos_operation_quantities', function (Blueprint $table) {
            $table->unsignedBigInteger('prod_order_pos_operation_confirmation_id')->nullable();
            $table->foreign('prod_order_pos_operation_confirmation_id', 'prod_order_pos_operation_quantities_p_o_p_o_c_id_foreign')
                  ->references('id')
                  ->on('prod_order_pos_operation_confirmations');

            $table->dropColumn("custom_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_quantities', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operation_quantities_p_o_p_o_c_id_foreign');
            $table->dropColumn('prod_order_pos_operation_confirmation_id');
            $table->string("custom_id")->nullable();
        });
    }
};
