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
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->dropColumn(['sample_depth', 'kbz_p_20', 'rp_0_2']);
            $table->string('max_sample_depth')->nullable();
            $table->boolean('buffer_90_mm')->default(false);
            $table->integer('lotweight')->nullable();
            $table->integer('max_lotsize')->nullable();
            $table->integer('max_ht_weight_lot_testing')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->string('sample_depth')->nullable();
            $table->double('kbz_p_20')->nullable();
            $table->double('rp_0_2')->nullable();
            $table->dropColumn([
                'max_sample_depth',
                'buffer_90_mm',
                'lotweight',
                'max_lotsize',
                'max_ht_weight_lot_testing'
            ]);
        });
    }
};
