<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->foreignId('sales_order_pos_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_sales_order_pos_id_foreign');
            $table->dropColumn('sales_order_pos_id');
        });
    }
};
