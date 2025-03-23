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
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->double('forged_beam_value_1')->nullable();
            $table->double('forged_beam_value_2')->nullable();
            $table->double('forged_beam_value_3')->nullable();
            $table->double('forged_beam_value_4')->nullable();
            $table->double('forged_beam_value_5')->nullable();
            $table->double('forged_beam_value_6')->nullable();
            $table->double('forged_beam_value_7')->nullable();
            $table->double('forged_beam_value_8')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropColumn([
                'forged_beam_value_1',
                'forged_beam_value_2',
                'forged_beam_value_3',
                'forged_beam_value_4',
                'forged_beam_value_5',
                'forged_beam_value_6',
                'forged_beam_value_7',
                'forged_beam_value_8'
            ]);
        });
    }
};
