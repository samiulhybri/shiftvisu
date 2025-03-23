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
        Schema::table('data_exports', function (Blueprint $table) {
            $table->string('http_method')->nullable();
            $table->string('http_url')->nullable();
            $table->text('http_payload')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data_exports', function (Blueprint $table) {
            $table->dropColumn('http_method');
            $table->dropColumn('http_url');
            $table->dropColumn('http_payload');
        });
    }
};
