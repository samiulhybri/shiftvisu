<?php

use App\Models\ProductionSupplyArea;
use App\Models\StorageBin;
use App\Models\StorageLocation;
use App\Models\StorageSection;
use App\Models\StorageType;
use App\Models\Warehouse;
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
        Schema::table('stocks', function (Blueprint $table) {
            $table->nullableMorphs('positionable');
        });

        // move the existing data to new positionable

        DB::table('stocks')
            ->whereNotNull('storage_location_id')
            ->update([
                'positionable_type' => StorageLocation::class,
                'positionable_id' => DB::raw('storage_location_id')
            ]);

        DB::table('stocks')
            ->whereNotNull('storage_type_id')
            ->update([
                'positionable_type' => StorageType::class,
                'positionable_id' => DB::raw('storage_type_id')
            ]);

        DB::table('stocks')
            ->whereNotNull('storage_section_id')
            ->update([
                'positionable_type' => StorageSection::class,
                'positionable_id' => DB::raw('storage_section_id')
            ]);

        DB::table('stocks')
            ->whereNotNull('storage_bin_id')
            ->update([
                'positionable_type' => StorageBin::class,
                'positionable_id' => DB::raw('storage_bin_id')
            ]);

        DB::table('stocks')
            ->whereNotNull('production_supply_area_id')
            ->update([
                'positionable_type' => ProductionSupplyArea::class,
                'positionable_id' => DB::raw('production_supply_area_id')
            ]);

        DB::table('stocks')
            ->whereNotNull('warehouse_id')
            ->update([
                'positionable_type' => Warehouse::class,
                'positionable_id' => DB::raw('warehouse_id')
            ]);

        Schema::table('stocks', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(StorageLocation::class);
            $table->dropConstrainedForeignIdFor(StorageType::class);
            $table->dropConstrainedForeignIdFor(StorageSection::class);
            $table->dropConstrainedForeignIdFor(StorageBin::class);
            $table->dropConstrainedForeignIdFor(ProductionSupplyArea::class);
            $table->dropConstrainedForeignIdFor(Warehouse::class);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->foreignIdFor(StorageLocation::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageType::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageSection::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(StorageBin::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(ProductionSupplyArea::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Warehouse::class)->nullable()->constrained()->nullOnDelete();
        });

        // Then, move the data back to the original columns
        DB::table('stocks')
            ->where('positionable_type', StorageLocation::class)
            ->update([
                'storage_location_id' => DB::raw('positionable_id')
            ]);

        DB::table('stocks')
            ->where('positionable_type', StorageType::class)
            ->update([
                'storage_type_id' => DB::raw('positionable_id')
            ]);

        DB::table('stocks')
            ->where('positionable_type', StorageSection::class)
            ->update([
                'storage_section_id' => DB::raw('positionable_id')
            ]);

        DB::table('stocks')
            ->where('positionable_type', StorageBin::class)
            ->update([
                'storage_bin_id' => DB::raw('positionable_id')
            ]);

        DB::table('stocks')
            ->where('positionable_type', ProductionSupplyArea::class)
            ->update([
                'production_supply_area_id' => DB::raw('positionable_id')
            ]);

        DB::table('stocks')
            ->where('positionable_type', Warehouse::class)
            ->update([
                'warehouse_id' => DB::raw('positionable_id')
            ]);

        Schema::table('stocks', function (Blueprint $table) {
            $table->dropMorphs('positionable');
        });
    }
};
