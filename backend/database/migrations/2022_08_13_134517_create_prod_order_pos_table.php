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
        Schema::create('prod_order_pos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('prod_order_id')->constrained()->cascadeOnDelete();
            $table->string('pos');
            $table->unique(['prod_order_id', 'pos']);
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bom_id')->nullable()->constrained()->nullOnDelete();
            $table->date('start')->nullable();
            $table->date('end')->nullable();
            $table->double('quantity')->default(0);
            $table->integer('cavity')->default(1);
            
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
        Schema::dropIfExists('prod_order_pos');
    }
};
