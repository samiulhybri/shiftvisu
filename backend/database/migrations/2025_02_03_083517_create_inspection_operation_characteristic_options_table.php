<?php

use App\Models\AttributeSetOption;
use App\Models\InspectionOperationCharacteristic;
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
        Schema::create('inspection_operation_characteristic_options', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(InspectionOperationCharacteristic::class)->constrained(indexName: 'option_characteristic_foreign');
            $table->foreignIdFor(AttributeSetOption::class)->nullable()->constrained(indexName: 'option_attribute_set_foreign')->nullOnDelete();
            $table->string('custom_id');
            $table->string('valuation');
            $table->unique(['inspection_operation_characteristic_id', 'custom_id'], name: 'operation_characteristic_custom_id_unique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_operation_characteristic_options');
    }
};
