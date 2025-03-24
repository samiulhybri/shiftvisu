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
        Schema::create('inspection_characteristics', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->string('characteristic_type')->default('QUALITATIVE');
            $table->foreignIdFor(\App\Models\UnitOfMeasure::class)->constrained()->cascadeOnDelete();
            $table->double('standard_value');
            $table->integer('number_of_decimals');
            $table->double('lower_limit');
            $table->double('upper_limit');
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
        Schema::dropIfExists('inspection_characteristics');
    }
};
