<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('eight_d_reports', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('complaint_no')->nullable();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('drawing_no')->nullable();
            $table->string('drawing_revision')->nullable();
            $table->foreignId('plant_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('quantity_delivered')->nullable();
            $table->string('part_name')->nullable();
            $table->date('complaint_opening_date')->nullable();
            $table->integer('revision')->nullable();
            $table->date('revision_date')->nullable();
            $table->integer('quantity_claimed')->nullable();
            $table->string('description')->nullable();
            $table->boolean('author_accepted')->nullable();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete()->cascadeOnUpdate();
            $table->date('author_closing_date')->nullable();
            $table->boolean('schaeffler_accepted')->nullable();
            $table->date('schaeffler_closing_date')->nullable();
            $table->foreignId('chat_id')->constrained()->cascadeOnDelete()->cascadeOnUpdate();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eight_d_reports');
    }
};
