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
        Schema::create('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prod_order_pos_id')->constrained()->cascadeOnDelete();
            $table->string('pos');
            $table->unique(['prod_order_pos_id', 'pos']);
            $table->foreignId('item_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('qty_for_one_parent');
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
        Schema::dropIfExists('prod_order_pos_bom_pos');
    }
};
