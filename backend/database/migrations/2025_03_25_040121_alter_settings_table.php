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
        Schema::table('settings', function (Blueprint $table) {
            $table->boolean('show_filter_hall')->nullable()->default(1);
            $table->boolean('show_filter_machine_group')->nullable()->default(1);
            $table->boolean('show_filter_machine')->nullable()->default(1);
            $table->boolean('show_filter_item')->nullable()->default(1);
            $table->boolean('show_filter_prod_order')->nullable()->default(1);
            $table->boolean('show_op_prod_order')->nullable()->default(1);
            $table->boolean('show_op_item')->nullable()->default(1);
            $table->boolean('show_op_due_date')->nullable()->default(1);
            $table->boolean('show_op_release_date')->nullable()->default(1);
            $table->boolean('show_op_constraint_type')->nullable()->default(1);
            $table->boolean('show_op_alt_machine')->nullable()->default(1);
            $table->boolean('show_op_customer')->nullable()->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['show_filter_hall', 'show_filter_machine_group', 'show_filter_machine', 'show_filter_item', 'show_filter_prod_order', 'show_op_prod_order', 'show_op_item', 'show_op_due_date', 'show_op_release_date', 'show_op_constraint_type', 'show_op_alt_machine', 'show_op_customer']);
        });
    }
};
