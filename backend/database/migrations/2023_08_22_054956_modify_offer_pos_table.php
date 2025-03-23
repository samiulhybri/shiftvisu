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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropColumn('cutting_allowance');
            $table->double('is_divergent')->nullable();
            $table->double('min_cutting_allowance')->nullable();
            $table->double('max_cutting_allowance')->nullable();
            $table->double('min_allowance_outer_diameter')->nullable();
            $table->double('max_allowance_outer_diameter')->nullable();
            $table->double('min_allowance_side_a')->nullable();
            $table->double('max_allowance_side_a')->nullable();
            $table->double('min_allowance_side_b')->nullable();
            $table->double('max_allowance_side_b')->nullable();
            $table->double('min_allowance_inner_diameter')->nullable();
            $table->double('max_allowance_inner_diameter')->nullable();
            $table->double('min_allowance_height')->nullable();
            $table->double('max_allowance_height')->nullable();
            $table->double('min_allowance_length')->nullable();
            $table->double('max_allowance_length')->nullable();

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
            $table->string('cutting_allowance')->nullable();
            $table->dropColumn(['is_divergent',
                'min_cutting_allowance',
                'max_cutting_allowance',
                'min_allowance_outer_diameter',
                'max_allowance_outer_diameter',
                'min_allowance_side_a',
                'max_allowance_side_a',
                'min_allowance_side_b',
                'max_allowance_side_b',
                'min_allowance_inner_diameter',
                'max_allowance_inner_diameter',
                'min_allowance_height',
                'max_allowance_height',
                'min_allowance_length',
                'max_allowance_length'
            ]);
        });
    }
};
