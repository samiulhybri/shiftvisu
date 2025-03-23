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
        Schema::dropIfExists('handling_unit_item_movements');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('handling_unit_item_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('handling_unit_pos_id')->constrained();
            $table->double('quantity')->nullable();
            $table->boolean('is_exported')->default(false);
            $table->timestamps();
        });
    }
};
