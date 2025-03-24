<?php

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
        Schema::create('prod_inspection_operations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPosOperation::class)->constrained();
            $table->string('pos');
            $table->boolean('is_active')->default(true);
            $table->string('frequency');
            $table->boolean('is_blocking')->default(false);
            $table->timestamps();
            $table->unique(['prod_order_pos_operation_id', 'pos'], 'operation_pos_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prod_inspection_operations');
    }
};
