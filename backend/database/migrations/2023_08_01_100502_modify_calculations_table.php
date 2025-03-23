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
        Schema::table('calculations', function (Blueprint $table) {
            $table->double('strength_span_min')->nullable();
            $table->double('strength_span_max')->nullable();
            $table->double('hardness')->nullable();
            $table->boolean('charge')->default(false);
            $table->boolean('melting_process')->default(false);
            $table->boolean('cleanliness_of_the_charge')->default(false);
            $table->boolean('cleanliness_of_the_component')->default(false);
            $table->boolean('grainsize_of_the_charge')->default(false);
            $table->boolean('grainsize_of_the_component')->default(false);
            $table->boolean('piece_analysis')->default(false);
            $table->boolean('jominy')->default(false);
            $table->boolean('heattreamtment')->default(false);
            $table->boolean('heattreamtment_with_diagram')->default(false);
            $table->boolean('last_deformation')->default(false);
            $table->boolean('pmi')->default(false);
            $table->boolean('hardness_testing_hbw')->default(false);
            $table->boolean('hardness_testing_hbw_per_piece')->default(false);
            $table->boolean('conversion_acc_iso_18265_table_a_1')->default(false);
            $table->boolean('conversion_acc_iso_18265_table_b_2')->default(false);
            $table->boolean('visual_inspection')->default(false);
            $table->boolean('indication_of_the_surface_condition')->default(false);
            $table->boolean('dimension_control')->default(false);
            $table->boolean('dimension_protocol')->default(false);
            $table->boolean('residual_magnetic_field_strength')->default(false);
            $table->boolean('radioactivity_freedom_confirmation')->default(false);
            $table->boolean('confirmation_of_the_absence_of_flakes')->default(false);
            $table->boolean('create_forging_schedule')->default(false);
            $table->boolean('create_specimen_plan')->default(false);
            $table->boolean('create_us_test_instruction')->default(false);
            $table->boolean('create_mpe_test_instruction')->default(false);
            $table->boolean('create_fe_test_instruction')->default(false);
            $table->boolean('create_manufacturing_plan')->default(false);
            $table->boolean('create_heat_treatment_plan')->default(false);
            $table->boolean('test_sequence_plan')->default(false);
            $table->boolean('get_approval_from_the_client')->default(false);
            $table->boolean('initial_inspection')->default(false);
            $table->boolean('concentricity_check')->default(false);
            $table->boolean('create_furnace_position_plan')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculations', function (Blueprint $table) {
            $table->dropColumn([
                'strength_span_min',
                'strength_span_max',
                'hardness',
                'charge',
                'melting_process',
                'cleanliness_of_the_charge',
                'cleanliness_of_the_component',
                'grainsize_of_the_charge',
                'grainsize_of_the_component',
                'piece_analysis',
                'jominy',
                'heattreamtment',
                'heattreamtment_with_diagram',
                'last_deformation',
                'pmi',
                'hardness_testing_hbw',
                'hardness_testing_hbw_per_piece',
                'conversion_acc_iso_18265_table_a_1',
                'conversion_acc_iso_18265_table_b_2',
                'visual_inspection',
                'indication_of_the_surface_condition',
                'dimension_control',
                'dimension_protocol',
                'residual_magnetic_field_strength',
                'radioactivity_freedom_confirmation',
                'confirmation_of_the_absence_of_flakes',
                'create_forging_schedule',
                'create_specimen_plan',
                'create_us_test_instruction',
                'create_mpe_test_instruction',
                'create_fe_test_instruction',
                'create_manufacturing_plan',
                'create_heat_treatment_plan',
                'test_sequence_plan',
                'get_approval_from_the_client',
                'initial_inspection',
                'concentricity_check',
                'create_furnace_position_plan'
            ]);
        });
    }
};
