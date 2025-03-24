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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropColumn(['min_cutting_allowance', 'max_cutting_allowance']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->double('min_cutting_allowance')->nullable();
            $table->double('max_cutting_allowance')->nullable();
        });
    }
};
