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
        Schema::table('operation_plan_pos', function (Blueprint $table) {
            $table->double('lead_time_days')->default(5);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('operation_plan_pos', function (Blueprint $table) {
            $table->dropColumn(['lead_time_days']);
        });
    }
};
