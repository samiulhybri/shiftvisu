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
        Schema::dropIfExists('command_last_starts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('command_last_starts', function (Blueprint $table) {
            $table->id();
            $table->string('command');
            $table->timestamp('last_start')->nullable();
            $table->timestamps();
        });
    }
};
