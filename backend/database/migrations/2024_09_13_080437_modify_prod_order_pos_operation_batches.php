<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->unique(['prod_order_pos_operation_id', 'batch'], 'p_o_p_o_b_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->dropUnique('p_o_p_o_b_unique');
        });
    }
};
