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
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->bigInteger('tool_insert_id')->unsigned()->index()->nullable(); 
            $table->foreign('tool_insert_id')->references('id')->on('tools');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropForeign('tool_insert_id');
            $table->dropColumn('tool_insert_id');
        });
    }
};
