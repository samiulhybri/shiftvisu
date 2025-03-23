<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transport_order_pos_deliveries', function (Blueprint $table) {
            $table->double('delivered_quantity')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_order_pos_deliveries', function (Blueprint $table) {
            $table->integer('delivered_quantity')->default(0)->change();
        });
    }
};
