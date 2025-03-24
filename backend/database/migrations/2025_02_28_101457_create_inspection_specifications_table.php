<?php

use App\Models\InspectionSpecificationImportanceCode;
use App\Models\Plant;
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
        Schema::create('inspection_specifications', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(true);
            $table->string('custom_id');
            $table->foreignIdFor(Plant::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(InspectionSpecificationImportanceCode::class)->nullable()->constrained(indexName: 'is_isimportance_code_fk')->nullOnDelete();
            $table->unique(['custom_id', 'plant_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_specifications');
    }
};
