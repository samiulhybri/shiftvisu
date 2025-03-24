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
        Schema::table('standard_value_key_activity_types', function (Blueprint $table) {
            $table->boolean('is_clockin_enabled')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('standard_value_key_activity_types', function (Blueprint $table) {
            $table->dropColumn('is_clockin_enabled');
        });
    }
};
