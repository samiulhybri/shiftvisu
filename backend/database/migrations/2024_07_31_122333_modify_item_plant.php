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
        Schema::table('item_plants', function (Blueprint $table) {
            $table->foreignIdFor(StorageLocation::class)->nullable()->constrained();
            $table->foreignIdFor(StorageLocation::class, 'storage_location_id_rework')->nullable()->constrained();
            $table->foreignIdFor(StorageLocation::class, 'storage_location_id_scrap')->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_plants', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(StorageLocation::class);
            $table->dropConstrainedForeignIdFor(StorageLocation::class, 'storage_location_id_rework');
            $table->dropConstrainedForeignIdFor(StorageLocation::class, 'storage_location_id_scrap');
        });
    }
};
