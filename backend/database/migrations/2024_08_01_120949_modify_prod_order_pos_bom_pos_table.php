<?php

use App\Models\StorageLocation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table("prod_order_pos_bom_pos", function (Blueprint $table) {
            $table->foreignIdFor(StorageLocation::class)->nullable()->constrained();
            $table->boolean("is_backflush")->default(true);
            $table->boolean("is_quantity_fixed")->default(false);
            $table->double("quantity_total")->default(0);
            $table->double("qty_for_one_parent")->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("prod_order_pos_bom_pos", function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(StorageLocation::class);
            $table->dropColumn("is_backflush");
            $table->dropColumn("is_quantity_fixed");
            $table->dropColumn("quantity_total");
            $table->double("qty_for_one_parent")->change();
        });
    }
};
