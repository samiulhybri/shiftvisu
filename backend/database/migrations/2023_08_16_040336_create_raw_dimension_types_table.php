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
        Schema::create('raw_dimension_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_pos_raw_dimensions_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->double('encore_info')->nullable();
            $table->double('tolerances')->nullable();
            $table->double('additional_dimensions')->nullable();
            $table->double('sample_allowance')->nullable();
            $table->index(['offer_pos_raw_dimensions_id', 'type']);
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
        Schema::dropIfExists('raw_dimension_types');
    }
};
