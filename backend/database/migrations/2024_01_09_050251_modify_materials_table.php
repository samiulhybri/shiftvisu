<?php

use App\Enums\HweShrinkage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->integer('forging_temperature_min')->nullable();
            $table->integer('forging_temperature_max')->nullable();
            $table->boolean('put_in_cold_oven')->default(false);
            $table->string('shrinkage')->default(HweShrinkage::ONE_AND_HALF_PERCENT());
            $table->string('color_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn(['forging_temperature_min',
                'forging_temperature_max',
                'put_in_cold_oven',
                'shrinkage',
                'color_type']);
        });
    }
};
