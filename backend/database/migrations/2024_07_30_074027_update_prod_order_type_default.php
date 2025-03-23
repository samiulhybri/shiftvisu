<?php

use App\Enums\ProdOrderPosStatus;
use App\Enums\ProdOrderType;
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
        Schema::table('prod_orders', function (Blueprint $table) {
            $table->string('order_type')->default(ProdOrderType::PRODUCTION())->change();
        });

        DB::table('prod_orders')
            ->where('order_type', ProdOrderPosStatus::IN_PRODUCTION())
            ->update(['order_type' => ProdOrderType::PRODUCTION()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_orders', function (Blueprint $table) {
            $table->string('order_type')->default(ProdOrderPosStatus::IN_PRODUCTION())->change();
        });

        DB::table('prod_orders')
            ->where('order_type', ProdOrderType::PRODUCTION())
            ->update(['order_type' => ProdOrderPosStatus::IN_PRODUCTION()]);
    }
};
