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
        Schema::table('item_groups', function (Blueprint $table) {
            $table->dropColumn(['is_stocked_in_hu','is_packaging']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_groups', function (Blueprint $table) {
            $table->boolean('is_stocked_in_hu')->default(false);
            $table->boolean('is_packaging')->default(false);
        });
    }
};
