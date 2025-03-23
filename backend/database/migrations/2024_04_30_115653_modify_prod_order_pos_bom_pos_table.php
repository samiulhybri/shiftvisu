<?php

use App\Models\ProdOrderPosOperation;
use App\Models\UnitOfMeasure;
use App\Models\Warehouse;
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
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->foreignIdFor(UnitOfMeasure::class)->nullable()->constrained();
            $table->string('batch')->nullable();
            $table->foreignIdFor(ProdOrderPosOperation::class)->nullable()->constrained();
            $table->string('name')->nullable();
            $table->foreignIdFor(Warehouse::class)->nullable()->constrained();
            $table->boolean('is_active')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('unit_of_measure_id');
            $table->dropConstrainedForeignId('prod_order_pos_operation_id');
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropColumn(['is_active','name','batch']);
        });
    }
};
