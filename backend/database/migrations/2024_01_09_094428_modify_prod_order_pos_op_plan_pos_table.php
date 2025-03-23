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
            $table->foreignIdFor(\App\Models\MachineGroup::class)->nullable()->constrained();
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
            $table->dropForeign('prod_order_pos_op_plan_pos_machine_group_id_foreign');
            $table->dropColumn([
                'machine_group_id',
            ]);
        });
    }
};
