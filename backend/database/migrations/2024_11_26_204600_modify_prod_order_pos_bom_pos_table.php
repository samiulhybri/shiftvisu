<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->string('item_number')->nullable();
            $table->dropColumn('item_numver');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_bom_pos', function (Blueprint $table) {
            $table->dropColumn('item_number');
            $table->string('item_numver')->nullable();
        });
    }
};
