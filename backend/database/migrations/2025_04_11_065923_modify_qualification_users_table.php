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
        Schema::table('qualification_users', function (Blueprint $table) {
            $table->double('hours_imported')->default(0);
            $table->double('operations_imported')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qualification_users', function (Blueprint $table) {
            $table->dropColumn(['hours_imported', 'operations_imported']);
        });
    }
};
