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
            $table->dropColumn([
                'regulation',
                'issue_revision',
                'with_applicable_standard',
                'chem_text_field',
                'is_classified_steel_plant',
                'is_eu_material',
                'jominy_batch',
                'continuous_casting',
                'ingot_casting',
                'deformation',
                'stretch_forging_degree',
                'mq_quality',
                'me_quality',
                'is_text_field'
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
        Schema::table('materials', function (Blueprint $table) {
            $table->string('regulation')->nullable();
            $table->string('issue_revision')->nullable();
            $table->string('with_applicable_standard')->nullable();
            $table->string('chem_text_field')->nullable();
            $table->boolean('is_classified_steel_plant')->default(false);
            $table->boolean('is_eu_material')->default(false);
            $table->string('jominy_batch')->nullable();
            $table->string('continuous_casting')->nullable();
            $table->string('ingot_casting')->nullable();
            $table->string('deformation')->nullable();
            $table->string('stretch_forging_degree')->nullable();
            $table->string('mq_quality')->nullable();
            $table->string('me_quality')->nullable();
            $table->string('is_text_field')->nullable();

        });
    }
};
