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
            $table->dropColumn([
                'hwe_block_geometry',
                'hwe_block_type',
                'hwe_cast_type',
                'hwe_supplier_name',
                ]);
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
            $table->string('hwe_block_geometry')->nullable();
            $table->string('hwe_block_type')->nullable();
            $table->string('hwe_cast_type')->nullable();
            $table->string('hwe_supplier_name')->nullable();
        });
    }
};
