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
        Schema::table('operation_control_profiles', function (Blueprint $table) {
            $table->string('confirmation_type')->nullable();
            $table->dropColumn('post_goods_receipt_automatically');
            $table->boolean('auto_post_goods_receipt')->default(false);
            $table->string('external_processing_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('operation_control_profiles', function (Blueprint $table) {
            $table->dropColumn(['confirmation_type', 'auto_post_goods_receipt', 'external_processing_type']);
            $table->boolean("post_goods_receipt_automatically")->default(false);
        });
    }
};
