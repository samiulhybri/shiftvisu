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
        Schema::table('hwe_melt_analyses', function (Blueprint $table) {
            $table->string('grain_size_specification')->nullable();
            $table->string('grain_size_procedure')->nullable();
            $table->string('grain_size_testing_scope')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_melt_analyses', function (Blueprint $table) {
            $table->dropColumn(['grain_size_specification',
                'grain_size_procedure',
                'grain_size_testing_scope'
            ]);
        });
    }
};
