<?php

use App\Models\Warehouse;
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
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->string('warehouse_process_type')->nullable();
            $table->string('stock_type')->nullable();
            $table->string('entitled_to_dispose_party')->nullable();
            $table->string('stock_owner')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->dropColumn(['warehouse_process_type', 'stock_type', 'entitled_to_dispose_party', 'stock_owner']);
        });
    }
};
