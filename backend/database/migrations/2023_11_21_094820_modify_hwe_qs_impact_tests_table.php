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
        Schema::table('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->dropColumn([
                'reh',
                'rp_0_2',
                'rm',
                'a5',
                'z',
                'rp_1_0',
                'rt_0_5',
                'e_module',
                'rp_rm_ratio'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hwe_qs_impact_tests', function (Blueprint $table) {
            $table->double('reh')->nullable();
            $table->double('rp_0_2')->nullable();
            $table->double('rm')->nullable();
            $table->double('a5')->nullable();
            $table->double('z')->nullable();
            $table->double('rp_1_0')->nullable();
            $table->double('rt_0_5')->nullable();
            $table->double('e_module')->nullable();
            $table->double('rp_rm_ratio')->nullable();
        });
    }
};
