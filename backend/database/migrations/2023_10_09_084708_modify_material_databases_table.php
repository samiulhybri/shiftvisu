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
        Schema::table('material_databases', function (Blueprint $table) {
            $table->dropColumn('hardness');
        });

        Schema::table('material_databases', function (Blueprint $table) {
            $table->double('hardness')->nullable();
            $table->double('min_tensile_strength')->nullable();
            $table->double('max_tensile_strength')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('material_databases', function (Blueprint $table) {
            $table->string('hardness')->nullable()->change();
            $table->dropColumn(['min_tensile_strength','max_tensile_strength']);
        });
    }
};
