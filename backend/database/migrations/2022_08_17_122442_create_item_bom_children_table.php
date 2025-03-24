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
        Schema::create('item_bom_children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('child_item_id');
            $table->string('pos');
            $table->foreign('child_item_id')->references('id')->on('items')->cascadeOnDelete();
            $table->unique(['item_id', 'child_item_id', 'pos']);
            $table->double('qty_child_for_one_parent')->default(1);
            $table->integer('lead_time_days')->default(0);
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
        Schema::dropIfExists('item_bom_children');
    }
};
