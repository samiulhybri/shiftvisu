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
        Schema::table('backlog_items', function (Blueprint $table) {
            $table->double('qty_call_off')->default(0)->change();
            $table->double('qty_stock')->default(0)->change();
            $table->double('qty_backlog')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('backlog_items', function (Blueprint $table) {
            $table->double('qty_call_off')->default(null)->change();
            $table->double('qty_stock')->default(null)->change();
            $table->double('qty_backlog')->default(null)->change();
        });
    }
};
