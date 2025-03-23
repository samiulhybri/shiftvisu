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
        Schema::create('command_schedules', function (Blueprint $table) {
            $table->id();

            $table->string('command')->unique();
            $table->integer('priority');
            $table->boolean('is_active')->default(true);
            $table->string('cron_expression');
            $table->dateTime('last_run_at')->nullable();
            $table->text('last_output')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('command_schedules');
    }
};
