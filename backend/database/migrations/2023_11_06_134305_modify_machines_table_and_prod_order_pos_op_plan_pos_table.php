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
        Schema::table('prod_order_pos_op_plan_pos', function (Blueprint $table) {
            $table->dateTime('erp_start')->nullable();
            $table->dateTime('erp_end')->nullable();
            $table->dateTime('plan_start')->nullable();
            $table->dateTime('plan_end')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos_op_plan_pos', function (Blueprint $table) {
            $table->dropColumn(['erp_start', 'erp_end', 'plan_start', 'plan_end']);
        });
    }
};
