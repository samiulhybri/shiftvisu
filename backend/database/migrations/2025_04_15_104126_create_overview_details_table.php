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
        Schema::create('shift_visu_overview_details', function (Blueprint $table) {
            $table->id();
            $table->integer('hall_id')->nullable();
            $table->integer('creator_id')->nullable();
            $table->integer('error_id')->nullable();
            $table->string('error_type')->nullable();
            $table->longText('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_visu_overview_details');
    }
};
