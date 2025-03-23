<?php

use App\Models\InspectionSpecificationImportanceCode;
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
        Schema::table('inspection_operation_characteristics', function (Blueprint $table) {
            $table->foreignIdFor(InspectionSpecificationImportanceCode::class)->nullable()->constrained(indexName: 'ioc_isimportancecode_fk')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inspection_operation_characteristics', function (Blueprint $table) {
            $table->dropForeign('ioc_isimportancecode_fk');
            $table->dropColumn(['inspection_specification_importance_code_id']);
        });
    }
};
