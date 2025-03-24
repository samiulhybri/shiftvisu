<?php

use App\Models\Plant;
use App\Models\ProductionSupplyArea;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->foreignIdFor(Plant::class)->nullable()->constrained();
            $table->foreignIdFor(ProductionSupplyArea::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(Plant::class);
            $table->dropConstrainedForeignIdFor(ProductionSupplyArea::class);
        });
    }
};
