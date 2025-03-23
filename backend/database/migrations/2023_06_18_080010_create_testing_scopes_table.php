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
        Schema::create('testing_scopes', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->string('regulation')->nullable();
            $table->string('issue_revision')->nullable();
            $table->string('attestation')->nullable();
            $table->string('frequency')->nullable();
            $table->string('frequency_at_3_2')->nullable();
            $table->string('specimen_material')->nullable();
            $table->string('specimen_allowance')->nullable();
            $table->string('testing_scope')->nullable();
            $table->boolean('specimen_dimension')->default(false);
            $table->string('bhp_dimension')->nullable();
            $table->boolean('specimen_rest_material')->default(false);
            $table->string('specimen_location')->nullable();
            $table->double('zug')->nullable();
            $table->double('kbz')->nullable();
            $table->double('wzv')->nullable();
            $table->boolean('tensile_test_external_testing')->default(false);
            $table->double('reh')->nullable();
            $table->double('reh_min')->nullable();
            $table->double('rp_0_2')->nullable();
            $table->double('rp_1_0')->nullable();
            $table->double('rm')->nullable();
            $table->double('rm_min')->nullable();
            $table->double('a5_min')->nullable();
            $table->double('a4_min')->nullable();
            $table->double('z_min')->nullable();
            $table->double('rp_rm_ratio')->nullable();
            $table->boolean('impact_test_external_testing')->default(false);
            $table->string('impact_test_typ')->nullable();
            $table->double('impact_test_temperature')->nullable();
            $table->double('impact_test_avg')->nullable();
            $table->double('impact_test_single')->nullable();
            $table->string('impact_test_details')->nullable();
            $table->string('tensile_test_details')->nullable();
            $table->string('tensile_test_warm_according_to')->nullable();
            $table->boolean('tensile_test_warm_external_testing')->default(false);
            $table->string('tensile_test_warm_temperature')->nullable();
            $table->string('tensile_test_warm_details')->nullable();
            $table->string('hardness_test_according_to')->nullable();
            $table->string('hardness_test_location')->nullable();
            $table->double('hbw_on_the_component')->nullable();
            $table->double('mpa_on_the_component')->nullable();
            $table->double('hbw_on_sample')->nullable();
            $table->double('mpa_on_sample')->nullable();
            $table->double('hardness_test_amount')->nullable();
            $table->string('hardness_test_details')->nullable();
            $table->string('hardness_test_type')->nullable();
            $table->string('hardness_details')->nullable();
            $table->boolean('jominy_test')->default(false);
            $table->string('jominy_specification')->nullable();
            $table->string('jominy_details')->nullable();
            $table->double('j_1_5_min')->nullable();
            $table->double('j_1_5_max')->nullable();
            $table->double('j_3_min')->nullable();
            $table->double('j_3_max')->nullable();
            $table->double('j_5_min')->nullable();
            $table->double('j_5_max')->nullable();
            $table->double('j_7_min')->nullable();
            $table->double('j_7_max')->nullable();
            $table->double('j_9_min')->nullable();
            $table->double('j_9_max')->nullable();
            $table->double('j_10_min')->nullable();
            $table->double('j_10_max')->nullable();
            $table->double('j_11_min')->nullable();
            $table->double('j_11_max')->nullable();
            $table->double('j_13_min')->nullable();
            $table->double('j_13_max')->nullable();
            $table->double('j_15_min')->nullable();
            $table->double('j_15_max')->nullable();
            $table->double('j_20_min')->nullable();
            $table->double('j_20_max')->nullable();
            $table->double('j_25_min')->nullable();
            $table->double('j_25_max')->nullable();
            $table->double('j_30_min')->nullable();
            $table->double('j_30_max')->nullable();
            $table->double('j_35_min')->nullable();
            $table->double('j_35_max')->nullable();
            $table->double('j_40_min')->nullable();
            $table->double('j_40_max')->nullable();
            $table->double('j_45_min')->nullable();
            $table->double('j_45_max')->nullable();
            $table->double('j_50_min')->nullable();
            $table->double('j_50_max')->nullable();
            $table->string('further_testing')->nullable();
            $table->boolean('further_testing_external')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('testing_scopes');
    }
};
