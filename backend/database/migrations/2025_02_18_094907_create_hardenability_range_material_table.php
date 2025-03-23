<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\HardenabilityRange;
use App\Models\Material;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('hardenability_range_material')){
            Schema::create('hardenability_range_material', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('hardenability_range_id');
                $table->unsignedBigInteger('material_id');
                $table->foreign('hardenability_range_id', 'ham_harden_ability_range_id_foreign')
                    ->references('id')->on('hardenability_ranges')
                    ->onDelete('cascade');
                $table->foreign('material_id', 'ham_material_id_foreign')
                    ->references('id')->on('materials')
                    ->onDelete('cascade');
                $table->timestamps();
            });
        }

        $existingData = HardenabilityRange::whereNotNull('material_id')
            ->get(['id', 'material_id']);

        foreach ($existingData as $range) {
            $hardenAbilityRange = HardenabilityRange::find($range->id);

            if($hardenAbilityRange) {
                $material = Material::find($range->material_id);
                if($material) {
                    $hardenAbilityRange->materials()->sync([$range->material_id]);
                }
            }
        }

        Schema::table('hardenability_ranges', function (Blueprint $table) {
            $table->dropForeign('hardenability_ranges_material_id_foreign');
            $table->dropColumn('material_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hardenability_ranges', function (Blueprint $table) {
            $table->unsignedBigInteger('material_id')->nullable();
            $table->foreign('material_id', 'hardenability_ranges_material_id_foreign')
                  ->references('id')->on('materials')
                  ->cascadeOnDelete();
        });

        $pivotData = DB::table('hardenability_range_material')->get();

        foreach ($pivotData as $row) {
            HardenabilityRange::where('id', $row->hardenability_range_id)
                ->update(['material_id' => $row->material_id]);
        }
        
        Schema::dropIfExists('hardenability_range_material');
    }
};
