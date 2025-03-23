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
        Schema::table('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->string('order_number_v10')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->dropColumn('order_number_v10');
        });
    }
};
