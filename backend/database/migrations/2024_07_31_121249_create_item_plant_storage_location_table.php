<?php

use App\Models\ItemPlant;
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
        Schema::create('item_plant_storage_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ItemPlant::class)->constrained();
            $table->foreignIdFor(StorageLocation::class)->constrained();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_plant_storage_locations');
    }
};
