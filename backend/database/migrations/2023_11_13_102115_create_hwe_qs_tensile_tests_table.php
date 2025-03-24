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
        Schema::create('hwe_qs_tensile_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prod_order_pos_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->foreignId('hwe_qs_sample_id')->nullable()->constrained()->nullOnDelete();
            $table->double('reh')->nullable();
            $table->double('rp_0_2')->nullable();
            $table->double('rm')->nullable();
            $table->double('a5')->nullable();
            $table->double('z')->nullable();
            $table->double('rp_1_0')->nullable();
            $table->double('rt_0_5')->nullable();
            $table->double('e_module')->nullable();
            $table->double('rp_rm_ratio')->nullable();
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
        Schema::dropIfExists('hwe_qs_tensile_tests');
    }
};
