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
        Schema::create('hwe_offer_pos_work_plan_lead_times', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignIdFor(App\Models\Machine::class)->nullable()->constrained()->nullOnDelete();
            $table->integer('lead_time_days')->default(0);
            $table->unique('name','machine_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hwe_offer_pos_work_plan_lead_times');
    }
};
