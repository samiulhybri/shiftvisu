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
        Schema::table('offer_pos_dimension_upset_part_forged_beams', function (Blueprint $table) {
            $table->double('oversize')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos_dimension_upset_part_forged_beams', function (Blueprint $table) {
            $table->dropColumn('oversize');
        });
    }
};
