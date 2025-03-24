<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transport_order_pos_deliveries', function (Blueprint $table) {
            $table->nullableMorphs('transportable', 'transport_OPD_transportable_type_transportable_id_index');
            $table->string('serial')->nullable();
            $table->string('batch')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_order_pos_deliveries', function (Blueprint $table) {
            $table->dropMorphs('transportable', 'transport_OPD_transportable_type_transportable_id_index');
            $table->dropColumn(['serial', 'batch']);
        });
    }
};
