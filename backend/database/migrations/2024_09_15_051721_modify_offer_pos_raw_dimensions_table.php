<?php

use App\Models\Machine;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->double('radial_width_pre_1')->nullable();
            $table->double('height_to_radial_width_pre_1')->nullable();
            $table->double('radial_width')->nullable();
            $table->double('radial_width_pre_2')->nullable();
            $table->double('slug_dm')->nullable();
            $table->double('slug_weight')->nullable();
            $table->double('slug_height')->nullable();
            $table->foreignIdFor(Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Machine::class, 'machine_id_2')->nullable()->constrained()->nullOnDelete();
            $table->double('round_min_dma')->nullable();
            $table->double('round_min_dmb')->nullable();
            $table->double('round_max_dma')->nullable();
            $table->double('round_max_dmb')->nullable();
            $table->double('square_min_dma')->nullable();
            $table->double('square_min_dmb')->nullable();
            $table->double('square_max_dma')->nullable();
            $table->double('square_max_dmb')->nullable();
            $table->double('octagon_min_swa')->nullable();
            $table->double('octagon_min_swb')->nullable();
            $table->double('octagon_max_swa')->nullable();
            $table->double('octagon_max_swb')->nullable();
            $table->double('material_forging_degree_total')->nullable();
            $table->double('rolling_path')->nullable();
            $table->double('axial_difference')->nullable();
            $table->double('radial_width_per_100_mm')->nullable();
            $table->double('height_to_radial_width')->nullable();
            $table->double('rolling_path_rollweg')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropColumn([
                'radial_width_pre_1',
                'height_to_radial_width_pre_1',
                'radial_width',
                'radial_width_pre_2',
                'slug_dm',
                'slug_weight',
                'slug_height',
                'round_min_dma',
                'round_min_dmb',
                'round_max_dma',
                'round_max_dmb',
                'square_min_dma',
                'square_min_dmb',
                'square_max_dma',
                'square_max_dmb',
                'octagon_min_swa',
                'octagon_min_swb',
                'octagon_max_swa',
                'octagon_max_swb',
                'material_forging_degree_total',
                'rolling_path',
                'axial_difference',
                'radial_width_per_100_mm',
                'height_to_radial_width',
                'rolling_path_rollweg',
            ]);

            $table->dropConstrainedForeignIdFor(Machine::class);
            $table->dropConstrainedForeignIdFor(Machine::class, 'machine_id_2');
        });
    }
};