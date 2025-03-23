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
        Schema::table('calculation_metallographies', function (Blueprint $table) {
            $table->dropColumn('cleanliness_determination_according_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calculation_metallographies', function (Blueprint $table) {
            $table->string('cleanliness_determination_according_to')->nullable();
        });
    }
};
