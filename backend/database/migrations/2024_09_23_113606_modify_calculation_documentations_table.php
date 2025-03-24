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
        Schema::table('calculation_documentations', function (Blueprint $table) {
            $table->string('fpp_nr')->nullable();
            $table->string('fpp_rev')->nullable();
            $table->string('process_route')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_documentations', function (Blueprint $table) {
            $table->dropColumn(['fpp_nr', 'fpp_rev', 'process_route']);
        });
    }
};
