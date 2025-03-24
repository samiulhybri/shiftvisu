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
        Schema::create('hwe_additional_costs', function (Blueprint $table) {
            $table->id();
            $table->string('hwe_cast_type')->unique()->required();
            $table->double('price')->required();
            $table->foreignId('unit_of_measure_id')->constrained('unit_of_measures')->nullable(false);
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
        Schema::dropIfExists('hwe_additional_costs');
    }
};
