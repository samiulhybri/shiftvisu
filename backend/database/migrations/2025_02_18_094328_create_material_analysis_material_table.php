<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\MaterialAnalysis;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('material_analysis_material', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('material_analysis_id');
            $table->unsignedBigInteger('material_id');
            $table->foreign('material_analysis_id', 'mam_material_analysis_id_foreign')
                  ->references('id')->on('material_analyses')
                  ->onDelete('cascade');
            $table->foreign('material_id', 'mam_materials_id_foreign')
                  ->references('id')->on('materials')
                  ->onDelete('cascade');
            $table->timestamps();
        });

        $existingData = MaterialAnalysis::whereNotNull('material_id')
            ->get(['id', 'material_id']);
        
        foreach ($existingData as $range) {
            $materialAnalysis = MaterialAnalysis::find($range->id);

            if($materialAnalysis) {
                $materialAnalysis->materials()->sync([$range->material_id]);
            } 
        }

        Schema::table('material_analyses', function (Blueprint $table) {
            $table->dropForeign('material_analyses_material_id_foreign');
            $table->dropColumn('material_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('material_analyses', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable();
            $table->foreign('material_id', 'material_analyses_material_id_foreign')
                  ->references('id')->on('materials')
                  ->cascadeOnDelete();
        });

        $pivotData = DB::table('material_analysis_material')->get();
        foreach ($pivotData as $row) {
            MaterialAnalysis::where('id', $row->material_analysis_id)
                ->update(['material_id' => $row->material_id]);
        }

        Schema::dropIfExists('material_analysis_material');
    }
};
