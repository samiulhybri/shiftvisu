<?php

use App\Models\Machine;
use App\Models\ProdOrderPosOperation;
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
        Schema::create('prod_order_pos_operation_alt_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPosOperation::class)
                ->constrained(indexName: "prod_order_pos_operation_alt_machines_id_foreign");
            $table->string("pos");
            $table->foreignIdFor(Machine::class)->nullable()->constrained();
            $table->timestamps();

            $table->unique(["pos", "prod_order_pos_operation_id"], "unique_pos_prod_order_pos_operation_id_alt_mach");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_order_pos_operation_alt_machines');
    }
};
