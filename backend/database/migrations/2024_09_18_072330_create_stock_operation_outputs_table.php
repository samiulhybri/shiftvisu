<?php

use App\Models\ItemState;
use App\Models\StockOperation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_operation_outputs', function (Blueprint $table) {
            $table->id();

            $table->foreignIdFor(StockOperation::class)->constrained();
            $table->double('quantity');
            $table->foreignIdFor(ItemState::class)->constrained();
            $table->string("batch")->nullable();
            $table->string("serial")->nullable();
            $table->morphs('stockable');
            $table->morphs('positionable');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_operation_outputs');
    }
};
