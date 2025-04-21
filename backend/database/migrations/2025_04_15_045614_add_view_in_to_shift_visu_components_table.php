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
        Schema::table('shift_visu_components', function (Blueprint $table) {
            $table->string('view_in')->nullable()->collation('utf8mb4_unicode_ci')->after('component_type');;
            $table->json('measure_options')->nullable()->after('view_in');;
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shift_visu_components', function (Blueprint $table) {
            $table->dropColumn(['view_in', 'measure_options']);
        });
    }
};
