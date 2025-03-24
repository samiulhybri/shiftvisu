<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->string('status_erp')->nullable();
            $table->string('status_plan')->nullable();
        });

        DB::table('prod_order_pos')->update([
            'status_plan' => DB::raw('status'),
        ]);

        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->string('status_erp')->nullable();
            $table->string('status_plan')->nullable();
        });

        DB::table('prod_order_pos_operations')->update([
            'status_plan' => DB::raw('status'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropColumn('status_erp');
            $table->dropColumn('status_plan');
        });

        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropColumn('status_erp');
            $table->dropColumn('status_plan');
        });
    }
};
