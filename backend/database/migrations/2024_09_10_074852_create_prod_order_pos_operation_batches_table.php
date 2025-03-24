<?php

use App\Enums\ProdOrderPosOperationHandlingUnitType;
use App\Models\Machine;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prod_order_pos_operation_batch_id')->nullable();
            $table->string('batch');
            $table->foreignIdFor(Machine::class)->nullable()->constrained();
            $table->string("type")->default(ProdOrderPosOperationHandlingUnitType::CONSUMPTION()->value);
            $table->timestamps();

            $table->foreign('prod_order_pos_operation_batch_id','prod_order_pos_operation_batch_id_foreign')->references('id')->on('prod_order_pos_operation_batches');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_order_pos_operation_batches');
    }
};
