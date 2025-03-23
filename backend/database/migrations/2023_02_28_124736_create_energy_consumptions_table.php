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
        Schema::create('energy_consumptions', function (Blueprint $table) {
            $table->id();
            $table->date("date");
            $table->foreignId('energy_consumer_id')->constrained()->cascadeOnDelete();
            $table->string("energy_type")->default(EnergyType::GAS());
            $table->integer("hour_of_day");
            $table->double("energy_consumption");
            $table->timestamps();
            $table->unique(["date", "energy_consumer_id", "energy_type", "hour_of_day"], "alternative_unique_index");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('energy_consumptions');
    }
};
