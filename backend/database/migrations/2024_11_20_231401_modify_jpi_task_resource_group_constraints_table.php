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
        Schema::table('jpi_task_resource_group_constraints', function (Blueprint $table) {
            $table->unique(['jpi_task_id', 'jpi_resource_group_id'], 'alt_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jpi_task_resource_group_constraints', function (Blueprint $table) {
//            $table->dropUnique('alt_unique');
//            TODO: This does not work
        });
    }
};
