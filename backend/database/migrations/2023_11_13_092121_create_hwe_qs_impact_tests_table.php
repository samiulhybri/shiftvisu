<?php

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
        Schema::create('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prod_order_pos_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->foreignId('hwe_qs_sample_id')->nullable()->constrained()->nullOnDelete();
            $table->double('lateral_expansion_1')->nullable();
            $table->double('reh')->nullable();
            $table->double('lateral_expansion_2')->nullable();
            $table->double('rp_0_2')->nullable();
            $table->double('lateral_expansion_3')->nullable();
            $table->double('rm')->nullable();
            $table->double('a5')->nullable();
            $table->double('fracture_surface_area_1')->nullable();
            $table->double('fracture_surface_area_2')->nullable();
            $table->double('z')->nullable();
            $table->double('fracture_surface_area_3')->nullable();
            $table->double('rp_1_0')->nullable();
            $table->string('fracture_type')->nullable();
            $table->double('rt_0_5')->nullable();
            $table->double('e_module')->nullable();
            $table->double('toughness_1')->nullable();
            $table->double('rp_rm_ratio')->nullable();
            $table->double('toughness_2')->nullable();
            $table->double('toughness_3')->nullable();
            $table->double('hardness')->nullable();
            $table->string('hardness_uom')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('hwe_qs_impact_tests');
    }
};
