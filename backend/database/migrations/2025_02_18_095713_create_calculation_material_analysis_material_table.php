<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\CalculationMaterialAnalysis;
use Illuminate\Support\Facades\DB;
use App\Models\Material;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calculation_material_analysis_material', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_material_analysis_id');
            $table->unsignedBigInteger('material_id');
            $table->foreign('calculation_material_analysis_id', 'cmam_calc_material_analyses_id_foreign')
                  ->references('id')->on('calculation_material_analyses')
                  ->onDelete('cascade');
            $table->foreign('material_id', 'cmam_material_id_foreign')
                  ->references('id')->on('materials')
                  ->onDelete('cascade');
            $table->timestamps();
        });

        $existingData = CalculationMaterialAnalysis::whereNotNull('material_id')
            ->get(['id', 'material_id']);

        foreach ($existingData as $range) {
            $calculationMaterialAnalysis = CalculationMaterialAnalysis::find($range->id);
            $material = Material::find($range->material_id);
            if($calculationMaterialAnalysis) {
                if($material) {
                    $calculationMaterialAnalysis->materials()->sync([$range->material_id]);
                }
            }
        }

        Schema::table('calculation_material_analyses', function (Blueprint $table) {
            $table->dropForeign('calculation_material_analyses_material_id_foreign');
            $table->dropColumn('material_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_material_analyses', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable();
            $table->foreign('material_id', 'calculation_material_analyses_material_id_foreign')
                  ->references('id')->on('materials')
                  ->cascadeOnDelete();
        });

        $pivotData = DB::table('calculation_material_analysis_material')->get();
        foreach ($pivotData as $row) {
            CalculationMaterialAnalysis::where('id', $row->calculation_material_analysis_id)
                ->update(['material_id' => $row->material_id]);
        }

        Schema::dropIfExists('calculation_material_analysis_material');
    }
};
