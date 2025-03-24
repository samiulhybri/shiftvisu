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
        Schema::create('operation_plan_pos_heat_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\OperationPlanPos::class)->constrained()->cascadeOnDelete();
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
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('operation_plan_pos_heat_treatments');
    }
};
