<?php

use App\Models\Hall;
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
        Schema::create('hall_capacity_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Hall::class)->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->double('machine_usage')->default(1);
            $table->double('employee_usage')->default(1);
            $table->double('overtime_factor')->default(0);
            $table->double('distribution_factor')->default(0);
            $table->double('additional_hours')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hall_capacity_settings');
    }
};
