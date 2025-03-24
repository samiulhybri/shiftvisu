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
        Schema::table('calculations', function (Blueprint $table) {
            $table->text('text')->nullable()->change();
            $table->text('text2')->nullable()->change();
            $table->text('text3')->nullable()->change();
            $table->text('text4')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculations', function (Blueprint $table) {
            $table->string('text')->nullable()->change();
            $table->string('text2')->nullable()->change();
            $table->string('text3')->nullable()->change();
            $table->string('text4')->nullable()->change();
        });
    }
};
