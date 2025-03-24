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
        Schema::create('calculation_vt_norm_auxiliary_means', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_vt_norm_id');
            $table->foreign('calculation_vt_norm_id', 'calculation_vt_norm_id_foreign')
                ->references('id')
                ->on('calculation_vt_norms')
                ->cascadeOnDelete();
            $table->string('auxiliary_mean');
            $table->index(['calculation_vt_norm_id', 'auxiliary_mean'], 'calculation_vt_norm_auxiliary_mean_unique_index');
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
        Schema::dropIfExists('calculation_vt_norm_auxiliary_means');
    }
};
