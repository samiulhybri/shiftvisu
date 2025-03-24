<?php
use App\Models\EnergyGateway;
use App\Enums\ModbusDataType;
use App\Enums\ModbusFunctionCode;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('energy_meters', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(EnergyGateway::class);
            $table->dropColumn([
                'factor',
                'interval',
                'input_number',
                'data_type',
                'modbus_function_code',
                'slave_id',
                'address',
                'next_read_at',
            ]);
           
            $table->string('custom_id');
            $table->boolean('is_active')->default(true)->first();
        });

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('energy_meters', function (Blueprint $table) {
            Schema::table('energy_meters', function (Blueprint $table) {
                $table->double('factor');
                $table->integer('interval')->nullable();
                $table->integer('input_number')->nullable();
                $table->string("data_type")->default(ModbusDataType::INTEGER())->nullable();
                $table->string("modbus_function_code")->default(ModbusFunctionCode::FC3())->nullable();
                $table->integer('slave_id')->nullable();
                $table->integer('address')->nullable();
                $table->foreignIdFor(EnergyGateway::class)->nullable()->constrained()->nullOnDelete();
                $table->timestamp('next_read_at')->nullable();
    
                $table->dropColumn(['custom_id', 'is_active']);
            });
    
        });
    }
};
