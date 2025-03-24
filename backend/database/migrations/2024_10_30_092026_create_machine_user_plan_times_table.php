<?php

use App\Models\Capacity;
use App\Models\Machine;
use App\Models\User;
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
        Schema::create('machine_user_plan_times', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Machine::class)->constrained();
            $table->foreignIdFor(User::class)->constrained();
            $table->dateTime("start_time");
            $table->dateTime("end_time");
            $table->foreignIdFor(Capacity::class)->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_user_plan_times');
    }
};
