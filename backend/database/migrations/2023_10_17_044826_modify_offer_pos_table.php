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
            $table->double('outer_diameter_lower_tolerance')->nullable();
            $table->double('outer_diameter_upper_tolerance')->nullable();
            $table->double('length_lower_tolerance')->nullable();
            $table->double('length_upper_tolerance')->nullable();
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
            $table->dropColumn(['outer_diameter_lower_tolerance',
                    'outer_diameter_upper_tolerance',
                    'length_lower_tolerance',
                    'length_upper_tolerance'
            ]);
        });
    }
};
