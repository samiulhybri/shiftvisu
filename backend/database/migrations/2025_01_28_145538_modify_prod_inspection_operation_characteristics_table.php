<?php

use App\Models\UnitOfMeasure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_inspection_operation_characteristics', function (Blueprint $table) {
            $table->string('pos');
            $table->string('name')->nullable();
            $table->boolean('is_quantitative')->default(true);
            $table->double('value_target')->nullable();
            $table->double('value_lower_limit')->nullable();
            $table->double('value_upper_limit')->nullable();
            $table->integer('decimals')->default(0);
            $table->foreignIdFor(UnitOfMeasure::class, 'unit_of_measure_id_value')->nullable()
                ->constrained(indexName: 'fk_char_unit_of_measure_id_value')->nullOnDelete();
            $table->integer('sample_size')->default(1);
            $table->foreignIdFor(UnitOfMeasure::class, 'unit_of_measure_id_sample')->nullable()
                ->constrained(indexName: 'fk_char_unit_of_measure_id_sample')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_inspection_operation_characteristics', function (Blueprint $table) {
            $table->dropColumn([
                'pos',
                'name',
                'is_quantitative',
                'value_target',
                'value_lower_limit',
                'value_upper_limit',
                'decimals',
                'sample_size',
            ]);
            $table->dropConstrainedForeignIdFor(UnitOfMeasure::class, 'unit_of_measure_id_value');
            $table->dropConstrainedForeignIdFor(UnitOfMeasure::class, 'unit_of_measure_id_sample');
        });
    }
};
