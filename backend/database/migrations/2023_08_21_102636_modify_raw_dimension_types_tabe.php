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
        Schema::table('raw_dimension_types', function (Blueprint $table) {
            $table->renameColumn('tolerances','lower_tolerance');
            $table->double('upper_tolerance')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('raw_dimension_types', function (Blueprint $table) {
            $table->renameColumn('lower_tolerance', 'tolerances');
            $table->dropColumn('upper_tolerance');
        });
    }
};
