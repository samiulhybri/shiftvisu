<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('eight_d_reports', function (Blueprint $table) {
            $table->string('client_name')->nullable();
            $table->renameColumn('schaeffler_accepted', 'client_accepted');
            $table->renameColumn('schaeffler_closing_date', 'client_closing_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eight_d_reports', function (Blueprint $table) {
            $table->dropColumn(['client_name']);
            $table->renameColumn('client_accepted', 'schaeffler_accepted');
            $table->renameColumn('client_closing_date', 'schaeffler_closing_date');
        });
    }
};
