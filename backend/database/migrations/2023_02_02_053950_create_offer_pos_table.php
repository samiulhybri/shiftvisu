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
        Schema::create('offer_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            $table->string('pos');
            $table->index(['offer_id', 'pos']);
            $table->foreignId('standard_item_id')->nullable()->references('id')->on('items')->cascadeOnDelete();
            $table->string('item_name')->nullable();
            $table->string('product_type')->nullable();
            $table->integer('quantity')->nullable();
            $table->integer('outer_diameter')->nullable();
            $table->integer('inner_diameter')->nullable();
            $table->integer('height')->nullable();
            $table->string('drawing_id')->nullable();
            $table->string('attachments')->nullable();
            $table->integer('offset_number')->nullable();
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
        Schema::dropIfExists('offer_pos');
    }
};
