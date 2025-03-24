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
        Schema::create('hwe_qs_jominy_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prod_order_pos_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->foreignId('hwe_qs_sample_id')->nullable()->constrained()->nullOnDelete();
            $table->string('variant')->nullable();
            $table->double('reh')->nullable();
            $table->double('value_0_5')->nullable();
            $table->double('value_1')->nullable();
            $table->double('value_1_5')->nullable();
            $table->double('value_2')->nullable();
            $table->double('value_3')->nullable();
            $table->double('value_4')->nullable();
            $table->double('value_5')->nullable();
            $table->double('e_module')->nullable();
            $table->double('value_6')->nullable();
            $table->double('rp_rm_ratio')->nullable();
            $table->double('value_7')->nullable();
            $table->double('value_8')->nullable();
            $table->double('value_9')->nullable();
            $table->double('value_10')->nullable();
            $table->double('value_11')->nullable();
            $table->double('value_13')->nullable();
            $table->double('value_15')->nullable();
            $table->double('value_20')->nullable();
            $table->double('value_25')->nullable();
            $table->double('value_30')->nullable();
            $table->double('value_35')->nullable();
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
        Schema::dropIfExists('hwe_qs_jominy_tests');
    }
};
