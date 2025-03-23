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
        Schema::table('hwe_offer_pos_work_plan_lead_times', function (Blueprint $table) {
            $table->dropUnique('machine_id');
            $table->unique(['name','machine_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hwe_offer_pos_work_plan_lead_times', function (Blueprint $table) {
            $table->dropUnique('hwe_offer_pos_work_plan_lead_times_name_machine_id_unique');
            $table->unique('name','machine_id');
        });
    }
};
