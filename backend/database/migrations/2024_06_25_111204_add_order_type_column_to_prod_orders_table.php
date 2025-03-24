<?php

use App\Enums\ProdOrderPosStatus;
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
        Schema::table('prod_orders', function (Blueprint $table) {
            $table->string('order_type')->default(ProdOrderPosStatus::IN_PRODUCTION());
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_orders', function (Blueprint $table) {
            $table->dropColumn('order_type');
        });
    }
};