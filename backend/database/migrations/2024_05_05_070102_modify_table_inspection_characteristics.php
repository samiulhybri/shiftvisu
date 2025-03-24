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
        Schema::table('inspection_characteristics', function (Blueprint $table) {
            $table->unsignedBigInteger('unit_of_measure_id')->nullable()->nullOnDelete()->change();
            $table->double('standard_value')->nullable()->change();
            $table->integer('number_of_decimals')->nullable()->change();
            $table->double('lower_limit')->nullable()->change();
            $table->double('upper_limit')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inspection_characteristics', function (Blueprint $table) {
            $table->unsignedBigInteger('unit_of_measure_id')->cascadeOnDelete()->change();
            $table->double('standard_value')->change();
            $table->integer('number_of_decimals')->change();
            $table->double('lower_limit')->change();
            $table->double('upper_limit')->change();
        });
    }
};
