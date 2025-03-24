<?php

use App\Models\HandlingUnit;
use App\Models\StorageBin;
use App\Models\StorageLocation;
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
        Schema::table('transport_order_pos', function (Blueprint $table) {
            $table->foreignIdFor(HandlingUnit::class)->nullable()->constrained();
            $table->foreignIdFor(StorageBin::class)->nullable()->constrained();
            $table->foreignIdFor(StorageLocation::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_order_pos', function (Blueprint $table) {
        $table->dropConstrainedForeignIdFor(HandlingUnit::class);
        $table->dropConstrainedForeignIdFor(StorageBin::class);
        $table->dropConstrainedForeignIdFor(StorageLocation::class);
        });
    }
};
