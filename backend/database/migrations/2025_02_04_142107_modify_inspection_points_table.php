<?php

use App\Models\InspectionLot;
use App\Models\InspectionPoint;
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
        Schema::table('inspection_points', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(InspectionLot::class);
            $table->foreignIdFor(InspectionLot::class)->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_points', function (Blueprint $table) {
            /**
             * If We create any column as not-nullable again, 
             * and there data already exists with null value, 
             * then the rollback will throw an exception.
             */
        });
    }
};
