<?php

use App\Models\HandlingUnit;
use App\Models\ProdOrderPosOperationConsumption;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('handling_unit_prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->id();
   
            $table->unsignedBigInteger('handling_unit_id');
            $table->foreign('handling_unit_id', 'handling_unit_prod_order_pos_operation_consumptions_h_u_foreign')
                  ->references('id')
                  ->on('handling_units');

            $table->unsignedBigInteger('prod_order_pos_operation_consumption_id');
            $table->foreign('prod_order_pos_operation_consumption_id', 'h_u_prod_order_pos_operation_consumptions_p_o_p_o_c_foreign')
                  ->references('id')
                  ->on('prod_order_pos_operation_consumptions');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('handling_unit_prod_order_pos_operation_consumptions');
    }
};
