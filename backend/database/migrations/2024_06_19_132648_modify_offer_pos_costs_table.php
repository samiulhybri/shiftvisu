<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('offer_pos_costs', function (Blueprint $table) {
            $table->string('hwe_cost_type')->default(\App\Enums\HweCostCalcType::PIECE());
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_costs', function (Blueprint $table) {
            $table->dropColumn('hwe_cost_type');
        });
    }
};
