<?php

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
        DB::table('prod_order_pos_operation_handling_units')->delete();

        Schema::table('prod_order_pos_operation_handling_units', function (Blueprint $table) {
            $table->unique(['prod_order_pos_operation_id', 'handling_unit_id'], 'p_o_p_o_h_u_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_handling_units', function (Blueprint $table) {
            $table->dropUnique('p_o_p_o_h_u_unique');
        });
    }
};
