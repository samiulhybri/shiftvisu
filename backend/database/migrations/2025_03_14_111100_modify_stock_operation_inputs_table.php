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
        Schema::table('stock_operation_inputs', function (Blueprint $table) {
            $table->unsignedBigInteger('positionable_id')->nullable()->change();
            $table->string('positionable_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_operation_inputs', function (Blueprint $table) {
            $table->unsignedBigInteger('positionable_id')->nullable(false)->change();
            $table->string('positionable_type')->nullable(false)->change();
        });
    }
};
