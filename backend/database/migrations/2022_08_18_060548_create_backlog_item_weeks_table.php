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
        Schema::create('backlog_item_weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('backlog_item_id')->constrained()->cascadeOnDelete();
            $table->integer('week');
            $table->integer('year');
            $table->unique(['backlog_item_id', 'week', 'year']);
            $table->double('qty_prod_order');
            $table->double('qty_call_off');
            $table->double('qty_stock');
            $table->double('qty_backlog');
            $table->double('qty_call_off_sim');
            $table->double('qty_stock_sim');
            $table->double('qty_backlog_sim');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('backlog_item_weeks');
    }
};
