<?php

use App\Models\ProdInspectionOperation;
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
        Schema::create('prod_inspection_operation_characteristics', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdInspectionOperation::class)->constrained(indexName: 'characteristic_operation_foreign');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_inspection_operation_characteristics');
    }
};
