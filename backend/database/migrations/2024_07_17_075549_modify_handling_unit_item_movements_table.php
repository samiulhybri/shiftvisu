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
        Schema::table('handling_unit_item_movements', function (Blueprint $table) {
            $table->dropForeign('handling_unit_item_movements_handling_unit_item_id_foreign');
            $table->dropColumn('handling_unit_item_id');
            $table->foreignId('handling_unit_pos_id')->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
