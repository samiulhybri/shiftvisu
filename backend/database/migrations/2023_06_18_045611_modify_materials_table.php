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
        Schema::table('materials', function (Blueprint $table) {
            $table->string('regulation');
            $table->string('issue_revision');
            $table->string('material');
            $table->string('with_applicable_standard');
            $table->string('mq_quality');
            $table->string('me_quality');
            $table->string('chem_text_field');
            $table->boolean('is_classified_steel_plant')->default(false);
            $table->boolean('is_eu_material')->default(false);
            $table->boolean('check_starting_material')->default(false);
            $table->string('jominy_batch')->nullable();
            $table->string('continuous_casting')->nullable();
            $table->string('ingot_casting')->nullable();
            $table->string('deformation')->nullable();
            $table->string('stretch_forging_degree')->nullable();
            $table->string('is_text_field');
            $table->string('note')->nullable();
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
            $table->dropColumn('regulation');
            $table->dropColumn('issue_revision');
            $table->dropColumn('material');
            $table->dropColumn('with_applicable_standard');
            $table->dropColumn('mq_quality');
            $table->dropColumn('me_quality');
            $table->dropColumn('chem_text_field');
            $table->dropColumn('is_classified_steel_plant');
            $table->dropColumn('is_eu_material');
            $table->dropColumn('check_starting_material');
            $table->dropColumn('jominy_batch');
            $table->dropColumn('continuous_casting');
            $table->dropColumn('ingot_casting');
            $table->dropColumn('deformation');
            $table->dropColumn('stretch_forging_degree');
            $table->dropColumn('is_text_field');
            $table->dropColumn('note');
        });
    }
};
