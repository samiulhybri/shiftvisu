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
        Schema::table('machine_groups', function ($table) {
            $table->dropForeign(['staging_area_id']);
        });
        Schema::dropIfExists('staging_areas');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
