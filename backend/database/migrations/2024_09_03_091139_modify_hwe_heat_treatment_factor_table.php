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
        Schema::table('hwe_heat_treatment_factors', function (Blueprint $table) {
            $table->string("material_group_type")->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_heat_treatment_factors', function (Blueprint $table) {
            $table->dropColumn("material_group_type");
        });
    }
};
