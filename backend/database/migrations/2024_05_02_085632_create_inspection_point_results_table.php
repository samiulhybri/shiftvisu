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
        Schema::create('inspection_point_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspection_point_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inspection_characteristic_id')->constrained()->cascadeOnDelete();
            $table->double('quantitative_value')->nullable();
            $table->unsignedBigInteger('inspection_characteristic_qualitative_option_id');
            $table->foreign('inspection_characteristic_qualitative_option_id', 'inspection_characteristic_foreign_for_inspection_point_results')
                ->references('id')
                ->on('inspection_characteristic_qualitative_options')
                ->cascadeOnDelete();
            $table->boolean('is_ok')->default(false);
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
        Schema::dropIfExists('inspection_point_results');
    }
};
