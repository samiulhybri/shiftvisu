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
            $table->double('plan_tr')->nullable()->after('tr');
            $table->double('erp_tr')->nullable()->after('plan_tr');

            $table->dateTime('plan_teardown_time')->nullable()->after('teardown_time');
            $table->dateTime('erp_teardown_time')->nullable()->after('plan_teardown_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->dropColumn('plan_tr');
            $table->dropColumn('erp_tr');
            
            $table->dropColumn('plan_teardown_time');
            $table->dropColumn('erp_teardown_time');
        });
    }
};
