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
        Schema::table('calculations', function (Blueprint $table) {
            $table->foreignId('non_destructive_testing_individual_id')
                ->nullable()->constrained()
                ->on('non_destructive_testings')
                ->references('id')
                ->nullOnDelete();
            $table->foreignId('deformation_individual_id')
                ->nullable()->constrained()
                ->on('deformations')
                ->references('id')
                ->nullOnDelete();
            $table->boolean('specify_deformation')->default(false);
            $table->dropColumn(['piece_analysis',
                'last_deformation',
                'cleanliness_of_the_component',
                'grainsize_of_the_component',
                'confirmation_of_the_absence_of_flakes',
                'create_specimen_plan',
                'create_mpe_test_instruction',
                'create_manufacturing_plan',
                'test_sequence_plan',
                'initial_inspection',
                'create_furnace_position_plan',
                'create_forging_schedule',
                'create_us_test_instruction',
                'create_fe_test_instruction',
                'create_heat_treatment_plan',
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
        Schema::table('calculations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('non_destructive_testing_individual_id');
            $table->dropConstrainedForeignId('deformation_individual_id');
            $table->dropColumn('specify_deformation');
            $table->boolean('piece_analysis')->default(false);
            $table->boolean('last_deformation')->default(false);
            $table->boolean('cleanliness_of_the_component')->default(false);
            $table->boolean('grainsize_of_the_component')->default(false);
            $table->boolean('confirmation_of_the_absence_of_flakes')->default(false);
            $table->boolean('create_specimen_plan')->default(false);
            $table->boolean('create_mpe_test_instruction')->default(false);
            $table->boolean('create_manufacturing_plan')->default(false);
            $table->boolean('test_sequence_plan')->default(false);
            $table->boolean('initial_inspection')->default(false);
            $table->boolean('create_furnace_position_plan')->default(false);
            $table->boolean('create_forging_schedule')->default(false);
            $table->boolean('create_us_test_instruction')->default(false);
            $table->boolean('create_fe_test_instruction')->default(false);
            $table->boolean('create_heat_treatment_plan')->default(false);
        });
    }
};
