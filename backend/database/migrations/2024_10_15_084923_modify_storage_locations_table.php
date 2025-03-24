<?php

use App\Models\Plant;
use App\Models\Warehouse;
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
        Schema::table('storage_locations', function (Blueprint $table) {
            $table->string('name')->nullable();
            $table->foreignIdFor(Warehouse::class)->nullable()->constrained();
            $table->foreignIdFor(Plant::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('storage_locations', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->dropConstrainedForeignIdFor(Warehouse::class);
            $table->dropConstrainedForeignIdFor(Plant::class);
        });
    }
};
