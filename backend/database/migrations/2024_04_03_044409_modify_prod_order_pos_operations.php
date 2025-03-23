<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->foreignIdFor(\App\Models\ProdLot::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropForeign('prod_order_pos_operations_prod_lot_id_foreign');
        });
    }
};
