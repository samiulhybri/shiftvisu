<?php

use App\Models\InspectionOperationCharacteristicOption;
use App\Models\InspectionPointCharacteristic;
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
        Schema::create('inspection_point_characteristic_options', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(InspectionPointCharacteristic::class)->constrained(indexName: 'point_char_opt_point_char_foreign')->cascadeOnDelete();
            $table->foreignIdFor(InspectionOperationCharacteristicOption::class)->constrained(indexName: 'point_char_opt_ope_char_opt_foreign')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_point_characteristic_options');
    }
};
