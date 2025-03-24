<?php

use App\Models\ProductionSupplyArea;
use App\Models\StorageBin;
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
        Schema::table('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->foreignIdFor(Warehouse::class)->nullable()->constrained();
            $table->foreignIdFor(StorageBin::class)->nullable()->constrained();
            $table->foreignIdFor(ProductionSupplyArea::class)->nullable()
                ->constrained(indexName: "prod_order_consumptions_psa_id_foreign");;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_consumptions', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Warehouse::class);
            $table->dropConstrainedForeignIdFor(StorageBin::class);
            $table->dropForeign("prod_order_consumptions_psa_id_foreign");
            $table->dropColumn("production_supply_area_id");
        });
    }
};
