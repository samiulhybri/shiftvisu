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
        if (Schema::hasTable('command_last_starts')) {
            return;
        }

        Schema::create('command_last_starts', function (Blueprint $table) {
            $table->id();
            $table->string("command")->unique();
            $table->dateTime("last_start");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('command_last_starts');
    }
};
