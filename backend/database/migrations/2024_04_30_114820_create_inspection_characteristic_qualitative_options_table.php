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
        Schema::create('inspection_characteristic_qualitative_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inspection_characteristic_id');
            $table->foreign('inspection_characteristic_id', 'inspection_characteristic_id_for_qualitative_options')->references('id')->on('inspection_characteristics')->cascadeOnDelete();
            $table->string('qualitative_option')->nullable();
            $table->string('name')->nullable();
            $table->boolean('is_ok')->default(false);
            $table->unique('inspection_characteristic_id', 'qualitative_option');
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
        Schema::dropIfExists('inspection_characteristic_qualitative_options');
    }
};
