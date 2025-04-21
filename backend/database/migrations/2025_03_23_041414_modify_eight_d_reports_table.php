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
        Schema::table('eight_d_reports', function (Blueprint $table) {
            $table->datetime('complaint_opening_date')->nullable()->change();
            $table->datetime('revision_date')->nullable()->change();
            $table->datetime('author_closing_date')->nullable()->change();
            $table->datetime('client_closing_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('eight_d_reports', function (Blueprint $table) {
            $table->date('complaint_opening_date')->nullable()->change();
            $table->date('revision_date')->nullable()->change();
            $table->date('author_closing_date')->nullable()->change();
            $table->date('client_closing_date')->nullable()->change();
        });
    }
};
