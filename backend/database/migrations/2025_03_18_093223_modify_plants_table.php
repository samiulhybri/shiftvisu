<?php

use App\Models\ProdOrderPosOperation;
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
        Schema::table('plants', function (Blueprint $table) {
            $table->foreignIdFor(ProdOrderPosOperation::class, 'prod_order_pos_operation_id_indirect')->nullable()->constrained()->nullOnDelete();
            $table->integer('qualivisu_block_threshold')->default(0);
            $table->integer('qualivisu_shift_check_offset')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(ProdOrderPosOperation::class, 'prod_order_pos_operation_id_indirect');
            $table->dropColumn(['qualivisu_block_threshold', 'qualivisu_shift_check_offset']);
        });
    }
};
