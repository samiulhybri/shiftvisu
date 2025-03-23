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
        Schema::table('calculation_us_norm_adjustments', function (Blueprint $table) {
            Schema::dropIfExists('calculation_us_norm_adjustments');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculation_us_norm_adjustments', function (Blueprint $table) {
            Schema::create('calculation_us_norm_adjustments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('calculation_us_norm_id');
                $table->foreign('calculation_us_norm_id', 'calculation_us_norm_id_foreign')
                    ->references('id')
                    ->on('calculation_us_norms')
                    ->cascadeOnDelete();
                $table->string('adjustment');
                $table->index(['calculation_us_norm_id','adjustment'], 'calculation_us_norm_adjustment_unique');
                $table->timestamps();
            });
        });
    }
};
