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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->renameColumn('min_allowance_outer_diameter', 'min_allowance_outer_diameter_final');
            $table->renameColumn('max_allowance_outer_diameter', 'max_allowance_outer_diameter_final');
            $table->renameColumn('min_allowance_side_a', 'min_allowance_side_a_final');
            $table->renameColumn('max_allowance_side_a', 'max_allowance_side_a_final');
            $table->renameColumn('min_allowance_side_b', 'min_allowance_side_b_final');
            $table->renameColumn('max_allowance_side_b', 'max_allowance_side_b_final');
            $table->renameColumn('min_allowance_inner_diameter', 'min_allowance_inner_diameter_final');
            $table->renameColumn('max_allowance_inner_diameter', 'max_allowance_inner_diameter_final');
            $table->renameColumn('min_allowance_height', 'min_allowance_height_final');
            $table->renameColumn('max_allowance_height', 'max_allowance_height_final');
            $table->renameColumn('min_allowance_length', 'min_allowance_length_final');
            $table->renameColumn('max_allowance_length', 'max_allowance_length_final');
            $table->dropColumn('is_divergent');
            $table->string('outer_tolerance')->nullable();
            $table->string('inner_tolerance')->nullable();
            $table->string('side_a_tolerance')->nullable();
            $table->string('side_b_tolerance')->nullable();
            $table->string('height_tolerance')->nullable();
            $table->string('length_tolerance')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->renameColumn('min_allowance_outer_diameter_final', 'min_allowance_outer_diameter');
            $table->renameColumn('max_allowance_outer_diameter_final', 'max_allowance_outer_diameter');
            $table->renameColumn('min_allowance_side_a_final', 'min_allowance_side_a');
            $table->renameColumn('max_allowance_side_a_final', 'max_allowance_side_a');
            $table->renameColumn('min_allowance_side_b_final', 'min_allowance_side_b');
            $table->renameColumn('max_allowance_side_b_final', 'max_allowance_side_b');
            $table->renameColumn('min_allowance_inner_diameter_final', 'min_allowance_inner_diameter');
            $table->renameColumn('max_allowance_inner_diameter_final', 'max_allowance_inner_diameter');
            $table->renameColumn('min_allowance_height_final', 'min_allowance_height');
            $table->renameColumn('max_allowance_height_final', 'max_allowance_height');
            $table->renameColumn('min_allowance_length_final', 'min_allowance_length');
            $table->renameColumn('max_allowance_length_final', 'max_allowance_length');
            $table->double('is_divergent')->nullable();
            $table->dropColumn([
                'outer_tolerance',
                'inner_tolerance',
                'side_a_tolerance',
                'side_b_tolerance',
                'height_tolerance',
                'length_tolerance'
            ]);
        });
    }
};
