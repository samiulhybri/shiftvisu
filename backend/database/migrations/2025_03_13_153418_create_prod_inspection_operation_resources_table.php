<?php

use App\Models\Equipment;
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
        Schema::create('prod_inspection_operation_resources', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(true);
            $table->foreignIdFor(ProdInspectionOperation::class)->constrained(indexName: 'pior_pio_foreign')->cascadeOnDelete();
            $table->string('pos')->nullable();
            $table->unique(['prod_inspection_operation_id', 'pos'], 'pior_unique');
            $table->foreignIdFor(Equipment::class)->nullable()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_inspection_operation_resources');
    }
};
