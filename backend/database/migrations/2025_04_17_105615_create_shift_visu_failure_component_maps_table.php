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
        Schema::create('shift_visu_failure_component_maps', function (Blueprint $table) {
            $table->id();
            $table->integer('component_id');
            $table->integer('failure_details_id');    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_visu_failure_component_maps');
    }
};
