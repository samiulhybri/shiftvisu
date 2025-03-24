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
        Schema::table('machine_cycles', function (Blueprint $table) {
            $table->index(['machine_id']);
            $table->index(['prod_order_pos_operation_id']);
            $table->index(['registered_datetime']);
            $table->index(['confirmed_datetime']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_cycles', function (Blueprint $table) {
            $table->dropIndex(['machine_id']);
            $table->dropIndex(['prod_order_pos_operation_id']);
            $table->dropIndex(['registered_datetime']);
            $table->dropIndex(['confirmed_datetime']);
        });
    }
};
