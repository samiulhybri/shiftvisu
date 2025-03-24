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
        Schema::table('calculation_deformations', function (Blueprint $table) {
            $table->dropUnique('calculation_deformations_custom_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_deformations', function (Blueprint $table) {
            $table->unique('custom_id', 'calculation_deformations_custom_id_unique');
        });
    }
};
