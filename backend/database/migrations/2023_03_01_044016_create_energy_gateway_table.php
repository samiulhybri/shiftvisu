<?php
use App\Enums\EnergyGatewayType;
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
        Schema::create('energy_gateways', function (Blueprint $table) {
            $table->id();
            $table->string("custom_id")->unique();
            $table->string("ip_address");
            $table->integer("port");
            $table->string("gateway_type")->default(EnergyGatewayType::ADVANTECH());
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
        Schema::dropIfExists('energy_gateways');
    }
};
