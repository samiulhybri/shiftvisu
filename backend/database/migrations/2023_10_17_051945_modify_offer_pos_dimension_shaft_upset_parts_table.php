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
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->renameColumn('outer_diameter', 'outer_diameter_start');
            $table->double('outer_diameter_end');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->renameColumn('outer_diameter_start', 'outer_diameter');
            $table->dropColumn('outer_diameter_end');
        });
    }
};
