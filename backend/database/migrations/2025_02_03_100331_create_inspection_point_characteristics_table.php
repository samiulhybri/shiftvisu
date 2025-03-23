<?php

use App\Models\InspectionOperationCharacteristic;
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
        Schema::create('inspection_point_characteristics', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(InspectionPoint::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(InspectionOperationCharacteristic::class)->constrained(indexName: 'point_char_operation_char_foreign')->cascadeOnDelete();
            $table->double('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_point_characteristics');
    }
};
