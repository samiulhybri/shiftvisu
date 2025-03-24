<?php

use App\Models\Item;
use App\Models\ProductionSupplyArea;
use App\Models\Stock;
use App\Models\StorageBin;
use App\Models\StorageSection;
use App\Models\StorageType;
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
        Schema::table('stocks', function (Blueprint $table) {
            $table->nullableMorphs('stockable');
        });
        Stock::get()
            ->each(function (Stock $stock) {
                $stock->update([
                    'stockable_id' => $stock->item_id,
                    'stockable_type' => Item::class
                ]);
            });
        Schema::table('stocks', function (Blueprint $table) {
            $table->string('stockable_type')->nullable(false)->change();
            $table->unsignedBigInteger('stockable_id')->nullable(false)->change();
            $table->index('item_id');
            $table->dropUnique(['item_id', 'warehouse_id']);
            $table->dropConstrainedForeignIdFor(Item::class);
            $table->foreignIdFor(StorageLocation::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageType::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageSection::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageBin::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(ProductionSupplyArea::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId("bad_part_reason_id")->nullable()
                ->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->foreignIdFor(Item::class)->nullable()->constrained()->nullOnDelete();
        });
        Stock::get()
            ->each(function (Stock $stock) {
                if ($stock->stockable_type == Item::class) {
                    $stock->update([
                        'item_id' => $stock->stockable_id,
                    ]);
                } else {
                    $stock->delete();
                }
            });
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropMorphs('stockable');
            $table->dropConstrainedForeignIdFor(StorageLocation::class);
            $table->dropConstrainedForeignIdFor(StorageType::class);
            $table->dropConstrainedForeignIdFor(StorageSection::class);
            $table->dropConstrainedForeignIdFor(StorageBin::class);
            $table->dropConstrainedForeignIdFor(ProductionSupplyArea::class);
            $table->dropConstrainedForeignId("bad_part_reason_id");
        });
    }
};
