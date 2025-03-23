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
        Schema::create('sales_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->boolean('show_in_kanban')->default(true);
            $table->integer('sort_order')->default(0);
            $table->string('color', 6)->default('000000');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_statuses');
    }
};
