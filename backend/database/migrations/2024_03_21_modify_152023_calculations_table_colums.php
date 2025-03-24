<?php
use App\Models\Deformation;
use App\Models\HardenabilityRange;
use App\Models\Material;
use App\Models\MaterialAnalysis;
use App\Models\MtNorm;
use App\Models\PtNorm;
use App\Models\UsNorm;
use App\Models\VtNorm;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('calculations', function (Blueprint $table) {
        
            $table->dropForeign(['us_norm_id']);
            $table->dropForeign(['mt_norm_id']);
            $table->dropForeign(['pt_norm_id']);
            $table->dropForeign(['vt_norm_id']);
            $table->dropColumn([
                'us_norm_id',
                'mt_norm_id',
                'pt_norm_id',
                'vt_norm_id'
            ]);
            $table->foreignIdFor(HardenabilityRange::class)->nullable()->constrained()->cascadeOnDelete();  
            $table->foreignIdFor(Deformation::class)->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(MaterialAnalysis::class)->nullable()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculations', function (Blueprint $table) {
           // Drop the newly added columns 
            $table->dropForeign(['hardenability_range_id']);
            $table->dropForeign(['material_analysis_id']);
            $table->dropForeign(['deformation_id']);

            $table->dropColumn([
                'hardenability_range_id',
                'material_analysis_id',
                'deformation_id'
            ]);
          //  Add back the columns
            $table->foreignIdFor(UsNorm::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(VtNorm::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(PtNorm::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(MtNorm::class)->nullable()->constrained()->nullOnDelete();
        });
    }
};
