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
        Schema::table('prod_lots', function (Blueprint $table) {
            $table->decimal('temperature')->default(0);
            $table->boolean('is_cooldown_needed')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_lots', function (Blueprint $table) {
            $table->dropColumn('temperature');
            $table->dropColumn('is_cooldown_needed');
        });
    }
};
