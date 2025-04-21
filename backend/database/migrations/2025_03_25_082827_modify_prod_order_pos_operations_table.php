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
            $table->dropColumn('plan_teardown_time');
            $table->dropColumn('erp_teardown_time');
        });

        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            $table->integer('plan_teardown_time')->nullable()->after('teardown_time');
            $table->integer('erp_teardown_time')->nullable()->after('plan_teardown_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prod_order_pos_operations', function (Blueprint $table) {
            /**
             * We will always consider all teardown time related fields as integer.
             * So, no need to revert the column as something else type. It may cause unusual exception.
             */
        });
    }
};
