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
        Schema::table('machines', function (Blueprint $table) {
            $table->dropColumn(['supports_serial_or_batch_management', 'supports_component_serial_management']);

            $table->boolean('requires_batch_management_middle')->default(true);
            $table->boolean('requires_batch_management_last')->default(true);
            $table->string('quantity_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       
        Schema::table('machines', function (Blueprint $table) {
            $table->boolean('supports_serial_or_batch_management')->default(true);
            $table->boolean('supports_component_serial_management')->default(true);

            $table->dropColumn(['requires_batch_management_middle', 'requires_batch_management_last', 'quantity_type']);
        });
    }
};
