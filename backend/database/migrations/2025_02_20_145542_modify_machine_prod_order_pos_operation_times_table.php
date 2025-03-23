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
        Schema::table('machine_prod_order_pos_operation_times', function (Blueprint $table) {
            $table->index(['machine_id']);
            $table->index(['end']);
            $table->index(['prod_order_pos_operation_id'], 'mpopot_prod_order_pos_operation_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_prod_order_pos_operation_times', function (Blueprint $table) {
            $table->dropIndex(['machine_id']);
            $table->dropIndex(['end']);
            $table->dropIndex('mpopot_prod_order_pos_operation_id_index');
        });
    }
};
