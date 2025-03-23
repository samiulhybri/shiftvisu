<?php

use App\Enums\JpiJobStrategy;
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
        Schema::table('jpi_jobs', function (Blueprint $table) {
            $table->enum('strategy', [JpiJobStrategy::ASAP->value, JpiJobStrategy::JIT->value])->default(JpiJobStrategy::ASAP->value);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jpi_jobs', function (Blueprint $table) {
            $table->dropColumn(['strategy']);
        });
    }
};
