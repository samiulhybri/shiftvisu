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
        Schema::table('hwe_additional_costs', function (Blueprint $table) {
            $table->dropColumn(['min_value', 'max_value']);
            $table->integer('lead_time_days')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_additional_costs', function (Blueprint $table) {
            $table->double('min_value')->nullable();
            $table->double('max_value')->nullable();
            $table->dropColumn(['lead_time_days']);
        });
    }
};
