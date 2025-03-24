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
            if (!Schema::hasColumn('operation_plan_pos', 'cavity')) {
                $table->integer('cavity')->nullable()->default(1);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('operation_plan_pos', function (Blueprint $table) {
            if (Schema::hasColumn('operation_plan_pos', 'cavity')) {
                $table->dropColumn('cavity');
            }
        });
    }
};
