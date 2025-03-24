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
        Schema::create('documentations', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->boolean('charge')->default(false);
            $table->boolean('melting_process')->default(false);
            $table->boolean('cleanliness_of_the_charge')->default(false);
            $table->boolean('cleanliness_of_the_component')->default(false);
            $table->boolean('grainsize_of_the_charge')->default(false);
            $table->boolean('grainsize_of_the_component')->default(false);
            $table->boolean('product_analysis')->default(false);
            $table->boolean('jominy')->default(false);
            $table->boolean('heattreamtment')->default(false);
            $table->boolean('heattreamtment_with_diagram')->default(false);
            $table->boolean('deformation')->default(false);
            $table->boolean('hardness_testing_hbw')->default(false);
            $table->boolean('hardness_testing_hbw_per_piece')->default(false);
            $table->boolean('conversion_acc_iso_18265_table_a_1')->default(false);
            $table->boolean('conversion_acc_iso_18265_table_b_2')->default(false);
            $table->boolean('pmi')->default(false);
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
            $table->string('certificate')->nullable();
            $table->boolean('initial_inspection')->default(false);
            $table->boolean('concentricity_check')->default(false);
            $table->boolean('create_furnace_position_plan')->default(false);
            $table->string('text')->nullable();
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
        Schema::dropIfExists('documentations');
    }
};
