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
        Schema::rename('handling_unit_items', 'handling_unit_pos');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('handling_unit_pos', 'handling_unit_items');
    }
};
