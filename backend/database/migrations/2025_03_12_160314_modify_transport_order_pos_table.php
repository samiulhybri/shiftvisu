<?php

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
            $table->dropConstrainedForeignIdFor(StorageLocation::class, 'storage_location_id_source');
            $table->nullableMorphs('source');
            $table->nullableMorphs('destination');
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_order_pos', function (Blueprint $table) {
            $table->foreignIdFor(StorageLocation::class, 'storage_location_id_source')->nullable()->constrained()->nullOnDelete();
            $table->dropMorphs('source');
            $table->dropMorphs('destination');
        });
    }
};
