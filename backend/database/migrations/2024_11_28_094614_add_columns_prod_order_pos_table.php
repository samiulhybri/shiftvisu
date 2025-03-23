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
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->string('actual_time')->nullable()->default(null);
            $table->integer('cost')->nullable()->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropColumn(['actual_time', 'cost']);
        });
    }
};
