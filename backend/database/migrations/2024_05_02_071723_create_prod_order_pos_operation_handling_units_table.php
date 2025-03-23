<?php
use App\Enums\ProdOrderPosOperationHandlingUnitType;
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
        Schema::create('prod_order_pos_operation_handling_units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prod_order_pos_operation_id');
            $table->foreign('prod_order_pos_operation_id', 'prod_order_pos_operation_id_foreign_for_operation_handling_units')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\HandlingUnit::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default(App\Enums\ProdOrderPosOperationHandlingUnitType::PROD_GOOD());
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
        Schema::dropIfExists('prod_order_pos_operation_handling_units');
    }
};
