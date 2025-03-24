<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dateTime('due_date')->nullable();
        });

        DB::table('prod_order_pos')
            ->join('prod_orders', 'prod_order_pos.prod_order_id', '=', 'prod_orders.id')
            ->update(['prod_order_pos.due_date' => DB::raw('(SELECT due_date FROM prod_orders WHERE prod_orders.id = prod_order_pos.prod_order_id)')]);

        Schema::table('prod_orders', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropColumn('due_date');
        });

        Schema::table('prod_orders', function (Blueprint $table) {
            $table->dateTime('due_date')->nullable();
        });
    }
};
