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
            $table->dropColumn('hwe_cost_type');
            $table->string('hwe_cost_calc_type')->default(\App\Enums\HweCostCalcType::PIECE());
            $table->string('group_type')->default(\App\Enums\HweOfferPosGroupType::MANUAL());;
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
            $table->dropColumn(['hwe_cost_calc_type', 'group_type']);
            $table->string('hwe_cost_type')->default(\App\Enums\HweCostCalcType::PIECE());
        });
    }
};
