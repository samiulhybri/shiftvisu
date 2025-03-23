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
        Schema::table('hwe_qs_us_norms', function (Blueprint $table) {
            $table->renameColumn('test_device', 'testing_device');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_qs_us_norms', function (Blueprint $table) {
            $table->renameColumn('testing_device', 'test_device');
        });
    }
};
