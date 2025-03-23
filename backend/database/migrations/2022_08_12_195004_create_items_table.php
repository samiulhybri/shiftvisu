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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->foreignId('operation_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('bom_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->boolean('is_sales_item')->default(false);
            $table->boolean('is_alloy')->default(false);
            $table->boolean('use_stock_for_backlog')->default(true);
            $table->boolean('use_for_capacity_planning')->default(true);
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
        Schema::dropIfExists('items');
    }
};
