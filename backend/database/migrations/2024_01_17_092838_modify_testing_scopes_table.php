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
        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->double('rp_0_2_max')->nullable();
            $table->string('specimen_dimension')->default(null)->change();
            $table->dropColumn([
                'testing_scope',
                'impact_test_avg',
                'impact_test_single',
                'mpa_on_the_component',
                'mpa_on_sample',
                'jominy_specification'
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
            $table->dropColumn(['specimen_dimension']);
        });

        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->dropColumn('rp_0_2_max');
            $table->boolean('specimen_dimension')->default(false)->nullable(false);
            $table->string('testing_scope')->nullable();
            $table->double('impact_test_avg')->nullable();
            $table->double('impact_test_single')->nullable();
            $table->double('mpa_on_the_component')->nullable();
            $table->double('mpa_on_sample')->nullable();
            $table->string('jominy_specification')->nullable();
        });
    }
};
