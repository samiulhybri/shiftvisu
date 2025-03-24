<?php

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
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->double('kbz_p_20')->nullable();
            $table->double('kbz_0')->nullable();
            $table->double('kbz_m_20')->nullable();
            $table->double('kbz_m_50')->nullable();
            $table->double('kbz_m_60')->nullable();
            $table->double('zug_gt_40')->nullable();
            $table->double('zug_300')->nullable();
            $table->boolean('test_fold_and_bending')->default(false);
            $table->boolean('test_blue_structure')->default(false);
            $table->boolean('test_baumann_imprint')->default(false);
            $table->boolean('test_pin')->default(false);
            $table->boolean('test_us_calibration')->default(false);
            $table->dropColumn(['hardness_test_according_to',
                'hardness_test_amount',
                'wzv',
                'tensile_test_warm_temperature'
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
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->dropColumn(['kbz_p_20',
                'kbz_0',
                'kbz_m_20',
                'kbz_m_50',
                'kbz_m_60',
                'zug_gt_40',
                'zug_300',
                'test_fold_and_bending',
                'test_blue_structure',
                'test_baumann_imprint',
                'test_pin',
                'test_us_calibration',
            ]);
            $table->string('hardness_test_according_to')->nullable();
            $table->double('hardness_test_amount')->nullable();
            $table->double('wzv')->nullable();
            $table->double('tensile_test_warm_temperature')->nullable();
        });
    }
};
