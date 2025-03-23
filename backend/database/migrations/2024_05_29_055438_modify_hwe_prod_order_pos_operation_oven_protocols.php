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
        Schema::table('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->date('production_date')->nullable();
            $table->string('oven_row')->nullable();
            $table->string('oven_level')->nullable();
            $table->string('pre_heating')->nullable();
            $table->string('oven_loader')->nullable();
            $table->string('checked_by')->nullable();
            $table->integer('oven_position_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hwe_prod_order_pos_operation_oven_protocols', function (Blueprint $table) {
            $table->dropColumn('production_date');
            $table->dropColumn('oven_row');
            $table->dropColumn('oven_level');
            $table->dropColumn('pre_heating');
            $table->dropColumn('oven_loader');
            $table->dropColumn('checked_by');
            $table->dropColumn('oven_position_number');
        });
    }
};
