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
            $table->boolean('show_in_planvisu')->default(true);
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
            $table->dropColumn('show_in_planvisu');
        });
    }
};
