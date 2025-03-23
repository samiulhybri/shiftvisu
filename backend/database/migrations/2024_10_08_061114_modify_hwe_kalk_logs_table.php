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
        Schema::table('hwe_kalk_logs', function (Blueprint $table) {
            $table->text('changing_remark')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_kalk_logs', function (Blueprint $table) {
            $table->dropColumn('changing_remark');
        });
    }
};
