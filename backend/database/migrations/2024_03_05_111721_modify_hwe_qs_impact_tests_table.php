<?php

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
        Schema::table('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->dropForeign(['prod_order_pos_op_plan_pos_id']);
            $table->renameColumn('prod_order_pos_op_plan_pos_id', 'prod_order_pos_operation_id');
        });
        Schema::table('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->foreign('prod_order_pos_operation_id')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->dropForeign(['prod_order_pos_operation_id']);
            $table->renameColumn('prod_order_pos_operation_id', 'prod_order_pos_op_plan_pos_id');
        });
        Schema::table('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->foreign('prod_order_pos_op_plan_pos_id')
                ->references('id')
                ->on('prod_order_pos_operations')
                ->nullOnDelete();
        });
    }
};
