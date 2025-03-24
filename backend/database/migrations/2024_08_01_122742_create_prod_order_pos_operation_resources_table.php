<?php

use App\Models\Item;
use App\Models\ProdOrderPosOperation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('prod_order_pos_operation_resources', function (Blueprint $table) {
            $table->id();
            $table->boolean("is_active");
            $table->foreignIdFor(ProdOrderPosOperation::class)
                ->constrained(indexName: "prod_order_pos_operation_resources_operation_id_foreign");
            $table->string("pos");
            $table->foreignIdFor(Item::class, "item_id_tool")->nullable()->constrained();
            $table->timestamps();

            $table->unique(["pos", "prod_order_pos_operation_id"], "unique_pos_prod_order_pos_operation_id");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_order_pos_operation_resources');
    }
};
