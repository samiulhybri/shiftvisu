<?php

use App\Models\ProdInspectionOperation;
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
        Schema::table('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->foreignIdFor(ProdOrderPosOperation::class)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operation_batches', function (Blueprint $table) {
            $table->foreignIdFor(ProdOrderPosOperation::class)->change();
        });
    }
};
