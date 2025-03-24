<?php

use App\Models\Machine;
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
        Schema::table('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->unsignedBigInteger('machine_id_source')->nullable();
            $table->foreign('machine_id_source', 'oven_protocols_source_machine_id_foreign')
                ->references('id')
                ->on('machines')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->dropForeign('oven_protocols_source_machine_id_foreign');
            $table->dropColumn('machine_id_source');
        });
    }
};
