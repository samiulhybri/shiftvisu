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
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'country_code')) {
                $table->string('country_code')->nullable()->default(null);
            }
            if (!Schema::hasColumn('customers', 'linkeldn')) {
                $table->text('linkeldn')->nullable()->default(null);
            }
            if (!Schema::hasColumn('customers', 'wz_codes')) {
                $table->string('wz_codes')->nullable()->default(null);
            }
            if (!Schema::hasColumn('customers', 'branch_1')) {
                $table->string('branch_1')->nullable()->default(null);
            }
            if (!Schema::hasColumn('customers', 'branch_2')) {
                $table->string('branch_2')->nullable()->default(null);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            if (Schema::hasColumn('customers', 'country_code')) {
                $table->dropColumn('country_code');
            }
            if (Schema::hasColumn('customers', 'linkeldn')) {
                $table->dropColumn('linkeldn');
            }
            if (Schema::hasColumn('customers', 'wz_codes')) {
                $table->dropColumn('wz_codes');
            }
            if (Schema::hasColumn('customers', 'branch_1')) {
                $table->dropColumn('branch_1');
            }
            if (Schema::hasColumn('customers', 'branch_2')) {
                $table->dropColumn('branch_2');
            }
        });
    }
};
