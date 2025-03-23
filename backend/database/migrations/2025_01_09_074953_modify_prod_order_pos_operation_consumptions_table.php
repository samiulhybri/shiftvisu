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
        Schema::table('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->unsignedBigInteger('prod_order_pos_operation_confirmation_id')->nullable();
            $table->foreign('prod_order_pos_operation_confirmation_id', 'prod_order_pos_operation_consumptions_p_o_p_o_c_id_foreign')
                  ->references('id')
                  ->on('prod_order_pos_operation_confirmations');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operation_consumptions_p_o_p_o_c_id_foreign');
            $table->dropColumn('prod_order_pos_operation_confirmation_id');
        });
    }
};
