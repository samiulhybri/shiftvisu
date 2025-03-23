<?php

use App\Models\ProdOrder;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosSerial;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        ProdOrderPosSerial::truncate();
        Schema::table('prod_order_pos_serials', function (Blueprint $table) {
            $table->dropForeign(['prod_order_id']);
            $table->dropColumn('prod_order_id');
            $table->foreignIdFor(ProdOrderPos::class)->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos_serials', function (Blueprint $table) {
            $table->dropForeign(['prod_order_pos_id']);
            $table->dropColumn('prod_order_pos_id');
            $table->foreignIdFor(ProdOrder::class)->constrained()->cascadeOnDelete();
        });
    }
};
