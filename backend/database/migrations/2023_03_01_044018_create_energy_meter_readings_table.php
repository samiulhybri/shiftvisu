<?php

use App\Enums\EnergyType;
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
        Schema::create('energy_meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId("energy_consumer_id")->constrained()->cascadeOnDelete();
            $table->double("value");
            $table->string("energy_type")->default(EnergyType::GAS());
            $table->foreignId("energy_meter_id")->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('energy_meter_readings');
    }
};
