<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\CalculationHardenabilityRange;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calculation_hardenability_range_material', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_hardenability_range_id');
            $table->unsignedBigInteger('material_id');
            $table->foreign('calculation_hardenability_range_id', 'chrm_calc_harden_ability_range_id_foreign')
                ->references('id')->on('calculation_hardenability_ranges')
                ->onDelete('cascade');
            $table->foreign('material_id', 'chrm_material_id_foreign')
                ->references('id')->on('materials')
                ->onDelete('cascade');
            $table->timestamps();
        });

        $existingData = CalculationHardenabilityRange::whereNotNull('material_id')
            ->get(['id', 'material_id']);

        foreach ($existingData as $range) {
            $calculationHardenAbilityRange = CalculationHardenabilityRange::find($range->id);

            if($calculationHardenAbilityRange) {
                $calculationHardenAbilityRange->materials()->sync([$range->material_id]);
            }  
        }

        Schema::table('calculation_hardenability_ranges', function (Blueprint $table) {
            $table->dropForeign('calculation_hardenability_ranges_material_id_foreign');
            $table->dropColumn('material_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_hardenability_ranges', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable();
            $table->foreign('material_id', 'calculation_hardenability_ranges_material_id_foreign')
                  ->references('id')->on('materials')
                  ->cascadeOnDelete();
        });

        $pivotData = DB::table('calculation_hardenability_range_material')->get();
        foreach ($pivotData as $row) {
            CalculationHardenabilityRange::where('id', $row->calculation_hardenability_range_id)
                ->update(['material_id' => $row->material_id]);
        }

        Schema::dropIfExists('calculation_hardenability_range_material');
    }
};
