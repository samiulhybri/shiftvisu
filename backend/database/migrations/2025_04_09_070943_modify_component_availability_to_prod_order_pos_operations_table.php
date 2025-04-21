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
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->string('plan_component_availability')->nullable()->after('component_availability');
            $table->string('erp_component_availability')->nullable()->after('plan_component_availability');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropColumn(['plan_component_availability', 'erp_component_availability']);
        });
    }
};
