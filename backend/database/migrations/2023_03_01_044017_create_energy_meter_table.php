<?php

use App\Enums\ModbusDataType;
use App\Enums\EnergyType;
use App\Enums\ModbusFunctionCode;
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
        Schema::create('energy_meters', function (Blueprint $table) {
            $table->id();
            $table->double("factor")->nullable();
            $table->integer("interval")->nullable();
            $table->integer("input_number")->nullable();
            $table->string("data_type")->default(ModbusDataType::INTEGER())->nullable();
            $table->string("modbus_function_code")->default(ModbusFunctionCode::FC3())->nullable();
            $table->integer("slave_id")->nullable();
            $table->integer("address")->nullable();
            $table->foreignId("energy_consumer_id")->constrained()->cascadeOnDelete();
            $table->string("energy_type")->default(EnergyType::GAS());

            $table->foreignId("energy_gateway_id")->constrained()->cascadeOnDelete();
            $table->timestamp('next_read_at')->nullable();
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
        Schema::dropIfExists('energy_meters');
    }
};
