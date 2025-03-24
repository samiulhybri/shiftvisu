<?php

use App\Models\ProdOrderPosOperation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('prod_order_pos_operation_batches')->delete();

        Schema::table('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operation_batch_id_foreign');
            $table->dropColumn('prod_order_pos_operation_batch_id');
            $table->foreignIdFor(ProdOrderPosOperation::class)
                ->constrained(indexName: 'prod_order_pos_operation_id_foreign');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operation_id_foreign');
            $table->dropColumn('prod_order_pos_operation_id');

            $table->unsignedBigInteger('prod_order_pos_operation_batch_id');

            $table->foreign('prod_order_pos_operation_batch_id', 'prod_order_pos_operation_batch_id_foreign')->references('id')->on('prod_order_pos_operation_batches');
        });
    }
};
