<?php

use App\Models\Item;
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
        Schema::table('plants', function (Blueprint $table) {
            $table->foreignIdFor(Item::class, 'item_id_packaging_rework')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Item::class, 'item_id_packaging_scrap')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageLocation::class, 'storage_location_id_rework')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageLocation::class, 'storage_location_id_scrap')->nullable()->constrained()->nullOnDelete();
            $table->boolean('auto_post_goods_receipt_scrap')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plants', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Item::class, 'item_id_packaging_rework');
            $table->dropConstrainedForeignIdFor(Item::class, 'item_id_packaging_scrap');
            $table->dropConstrainedForeignIdFor(StorageLocation::class, 'storage_location_id_rework');
            $table->dropConstrainedForeignIdFor(StorageLocation::class, 'storage_location_id_scrap');
            $table->dropColumn('auto_post_goods_receipt_scrap');
        });
    }
};