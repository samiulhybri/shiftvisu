<?php

use App\Models\HandlingUnit;
use App\Models\StorageLocation;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("prod_order_pos_operation_consumptions", function (Blueprint $table) {
            $table->foreignIdFor(UnitOfMeasure::class)->nullable()->constrained();
            $table->foreignIdFor(StorageLocation::class)->nullable()
                ->constrained(indexName: "prod_order_consumptions_storage_location_id_foreign");
            $table->foreignIdFor(HandlingUnit::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("prod_order_pos_operation_consumptions", function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(UnitOfMeasure::class);
            $table->dropForeign("prod_order_consumptions_storage_location_id_foreign");
            $table->dropColumn("storage_location_id");
            $table->dropConstrainedForeignIdFor(HandlingUnit::class);
        });
    }
};
