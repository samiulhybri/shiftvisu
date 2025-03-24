<?php

use App\Models\InspectionLot;
use App\Models\Machine;
use App\Models\ProdOrderPosOperation;
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
        Schema::dropIfExists('inspection_point_results');
        Schema::dropIfExists('inspection_points');
        Schema::dropIfExists('prod_order_pos_operation_inspections');
        Schema::dropIfExists('inspection_characteristic_qualitative_options');
        Schema::dropIfExists('inspection_characteristics');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('inspection_characteristics', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->string('characteristic_type')->default('QUALITATIVE');
            $table->foreignIdFor(\App\Models\UnitOfMeasure::class)->nullable()->constrained()->nullOnDelete();
            $table->double('standard_value')->nullable();
            $table->integer('number_of_decimals')->nullable();
            $table->double('lower_limit')->nullable();
            $table->double('upper_limit')->nullable();
            $table->timestamps();
        });

        Schema::create('inspection_characteristic_qualitative_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inspection_characteristic_id');
            $table->foreign('inspection_characteristic_id', 'inspection_characteristic_id_for_qualitative_options')->references('id')->on('inspection_characteristics')->cascadeOnDelete();
            $table->string('qualitative_option')->nullable();
            $table->string('name')->nullable();
            $table->boolean('is_ok')->default(false);
            $table->unique('inspection_characteristic_id', 'qualitative_option');
            $table->timestamps();
        });

        Schema::create('prod_order_pos_operation_inspections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_inspections')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
            $table->string('inspection');
            $table->string('name')->nullable();
            $table->string('frequency')->default('OPERATION_START');
            $table->double('time_interval')->nullable();
            $table->double('quantity_interval')->nullable();
            $table->unique('prod_order_pos_operation_id', 'inspection');
            $table->timestamps();
        });

        Schema::create('inspection_points', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(InspectionLot::class)->constrained()->cascadeOnDelete();
            $table->foreignId('prod_order_pos_operation_inspection_id')->nullable()->constrained()->nullOnDelete();
            $table->dateTime('timestamp_completed')->nullable();
            $table->foreignIdFor(Machine::class)->constrained();
            $table->foreignIdFor(ProdOrderPosOperation::class)->constrained();
            $table->dateTime('date_opened')->useCurrent();
            $table->dateTime('date_completed')->nullable();
            $table->timestamps();
        });

        Schema::create('inspection_point_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_point_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inspection_characteristic_id')->constrained()->cascadeOnDelete();
            $table->double('quantitative_value')->nullable();
            $table->unsignedBigInteger('inspection_characteristic_qualitative_option_id')->nullable()->nullOnDelete();
            $table->foreign('inspection_characteristic_qualitative_option_id', 'inspection_characteristic_foreign_for_inspection_point_results')
                ->references('id')
                ->on('inspection_characteristic_qualitative_options')
                ->cascadeOnDelete();
            $table->boolean('is_ok')->default(false)->nullable();
            $table->timestamps();

        });
    }
};
