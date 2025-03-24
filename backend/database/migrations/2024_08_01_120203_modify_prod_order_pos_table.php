<?php

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
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->foreignIdFor(StorageLocation::class)->nullable()->constrained();
            $table->foreignIdFor(UnitOfMeasure::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(StorageLocation::class);
            $table->dropConstrainedForeignIdFor(UnitOfMeasure::class);
        });
    }
};
