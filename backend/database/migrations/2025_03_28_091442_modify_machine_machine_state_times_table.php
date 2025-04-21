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
        Schema::table('machine_machine_state_times', function (Blueprint $table) {
            $table->index(['machine_id']);
            $table->index(['end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('machine_machine_state_times', function (Blueprint $table) {
            $table->dropIndex(['machine_id']);
            $table->dropIndex(['end']);
        });
    }
};
