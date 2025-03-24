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
        Schema::table('hwe_certificates', function (Blueprint $table) {
            $table->boolean('is_show_chemical_analysis')->default(true);
            $table->boolean('is_show_grain_size_determination')->default(true);
            $table->boolean('is_show_purity_determination')->default(true);
            $table->boolean('is_show_jominy_test')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_certificates', function (Blueprint $table) {
            $table->dropColumn(['is_show_chemical_analysis',
                'is_show_grain_size_determination',
                'is_show_purity_determination',
                'is_show_jominy_test']);
        });
    }
};
