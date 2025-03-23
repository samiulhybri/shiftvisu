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
        Schema::table('customer_crm_action_logs', function (Blueprint $table) {
            Schema::table('customer_crm_action_logs', function (Blueprint $table) {
                $table->text('note')->nullable()->change(); // Change this to the desired type
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_crm_action_logs', function (Blueprint $table) {
            $table->string('note', 255)->change();
        });
    }
};
