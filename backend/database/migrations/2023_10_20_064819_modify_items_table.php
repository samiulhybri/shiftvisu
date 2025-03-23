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
        Schema::table('items', function (Blueprint $table) {
            $table->double('price')->default(0)->nullable();
            $table->double('stock')->default(0)->nullable();
            $table->integer('hwe_period_month')->default(0)->nullable();
            $table->integer('hwe_period_year')->default(0)->nullable();
            $table->string('hwe_norm_name')->nullable();
            $table->string('hwe_block_geometry')->nullable();
            $table->string('hwe_block_type')->nullable();
            $table->string('hwe_cast_type')->nullable();
            $table->string('hwe_supplier_name')->nullable();
            $table->string('hwe_warehouse_material')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['price', 'stock', 'hwe_period_month', 'hwe_period_year', 'hwe_norm_name',
                'hwe_block_geometry', 'hwe_block_type', 'hwe_cast_type', 'hwe_supplier_name', 'hwe_warehouse_material']);
        });
    }
};
