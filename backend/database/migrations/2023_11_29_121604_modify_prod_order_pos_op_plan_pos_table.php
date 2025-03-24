<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('prod_order_pos_op_plan_pos', function (Blueprint $table) {
            $table->double('plan_te')->nullable();
            $table->double('erp_te')->nullable();
            $table->foreignId('plan_machine_id')->nullable()->constrained()->references('id')->on('machines');
            $table->foreignId('erp_machine_id')->nullable()->constrained()->references('id')->on('machines');

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
            $table->dropForeign('prod_order_pos_op_plan_pos_plan_machine_id_foreign');
            $table->dropForeign( 'prod_order_pos_op_plan_pos_erp_machine_id_foreign');
            $table->dropColumn([
                'plan_te',
                'erp_te',
                'plan_machine_id',
                'erp_machine_id'
            ]);
        });
    }
};
