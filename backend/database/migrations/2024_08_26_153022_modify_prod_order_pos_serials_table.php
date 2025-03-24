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
        Schema::table('prod_order_pos_serials', function (Blueprint $table) {
            $table->unique(['prod_order_pos_id', 'serial']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_serials', function (Blueprint $table) {
            $table->dropUnique(['prod_order_pos_id', 'serial']);
        });
    }
};
