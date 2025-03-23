<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('calculation_residual_materials', function (Blueprint $table) {
            Schema::table('residual_materials', function (Blueprint $table) {
                $table->dropColumn('quantity_sample_geometries');
            });
            Schema::table('residual_materials', function (Blueprint $table) {
                $table->integer('quantity_sample_geometries')->nullable();
            });
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculation_residual_materials', function (Blueprint $table) {
            Schema::table('residual_materials', function (Blueprint $table) {
                $table->string('quantity_sample_geometries')->change();
            });
        });
    }
};
