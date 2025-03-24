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
        Schema::table('calculation_heat_treatments', function (Blueprint $table) {
            $table->double('heating_time')->nullable();
            $table->double('holding_time')->nullable();
            $table->double('cooldown_rate')->nullable();
            $table->double('cross_section')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculation_heat_treatments', function (Blueprint $table) {
            $table->dropColumn([
                'heating_time',
                'holding_time',
                'cooldown_rate',
                'cross_section'
            ]);
        });
    }
};
