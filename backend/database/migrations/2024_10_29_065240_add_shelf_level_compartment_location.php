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
        Schema::table('tools', function (Blueprint $table) {
            $table->string('storage_shelf')->nullable()->default(null);
            $table->string('storage_level')->nullable()->default(null);
            $table->string('storage_compartment')->nullable()->default(null);
            $table->string('storage_location')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropColumn('storage_shelf');
            $table->dropColumn('storage_level');
            $table->dropColumn('storage_compartment');
            $table->dropColumn('storage_location');
        });
    }
};
