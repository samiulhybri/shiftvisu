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
        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'height')) {
                $table->string('height')->nullable()->default(null);
            }
            if (!Schema::hasColumn('items', 'width')) {
                $table->string('width')->nullable()->default(null);
            }
            if (!Schema::hasColumn('items', 'length')) {
                $table->string('length')->nullable()->default(null);
            }
            if (!Schema::hasColumn('items', 'total_weight')) {
                $table->string('total_weight')->nullable()->default(null);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            if (Schema::hasColumn('items', 'height')) {
                $table->dropColumn('height');
            }
            if (Schema::hasColumn('items', 'width')) {
                $table->dropColumn('width');
            }
            if (Schema::hasColumn('items', 'length')) {
                $table->dropColumn('length');
            }
            if (Schema::hasColumn('items', 'total_weight')) {
                $table->dropColumn('total_weight');
            }
        });
    }
};