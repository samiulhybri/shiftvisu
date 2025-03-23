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
            $table->dropColumn([
                'quenching_medium',
                'hardness',
                'temperature_min',
                'temperature_max',
                'annealing_temperature',
                'internal_note',
                'heating_time',
                'holding_time',
                'cooldown_rate',
                'cross_section',
            ]);
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
            $table->string('quenching_medium')->nullable();
            $table->double('hardness')->nullable();
            $table->double('temperature_min')->nullable();
            $table->double('temperature_max')->nullable();
            $table->double('annealing_temperature')->nullable();
            $table->string('internal_note')->nullable();
            $table->double('heating_time')->nullable();
            $table->double('holding_time')->nullable();
            $table->double('cooldown_rate')->nullable();
            $table->double('cross_section')->nullable();
        });
    }
};
