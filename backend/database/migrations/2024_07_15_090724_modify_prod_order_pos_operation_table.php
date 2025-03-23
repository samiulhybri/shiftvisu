<?php

use App\Models\OperationPlan;
use App\Models\OperationPlanPos;
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
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->foreignIdFor(OperationPlan::class, 'operation_plan_id_origin')->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(OperationPlanPos::class, 'operation_plan_pos_id_origin')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(OperationPlan::class, 'operation_plan_id_origin');
            $table->dropConstrainedForeignIdFor(OperationPlanPos::class, 'operation_plan_pos_id_origin');
        });
    }
};
