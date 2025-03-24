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
        Schema::table('prod_inspection_operations', function (Blueprint $table) {
            $table->integer('interval_cycles')->nullable();
            $table->integer('interval_seconds')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_inspection_operations', function (Blueprint $table) {
            $table->dropColumn([
                'interval_cycles',
                'interval_seconds'
            ]);
        });
    }
};
