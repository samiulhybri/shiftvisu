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
            if (!Schema::hasColumn('prod_order_pos', 'is_sampling_required')) {
                $table->boolean('is_sampling_required')->nullable()->default(false);
            }
            if (!Schema::hasColumn('prod_order_pos', 'is_sampling_done')) {
                $table->boolean('is_sampling_done')->nullable()->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropColumn(['is_sampling_required', 'is_sampling_done']);
        });
    }
};
