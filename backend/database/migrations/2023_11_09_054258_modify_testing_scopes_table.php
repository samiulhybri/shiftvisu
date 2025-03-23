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
            $table->double('min_hbw_on_the_component')
                ->after('hbw_on_the_component')
                ->nullable();
            $table->double('min_hbw_on_sample')
                ->after('hbw_on_sample')
                ->nullable();
            $table->renameColumn('hbw_on_the_component', 'max_hbw_on_the_component');
            $table->renameColumn('hbw_on_sample', 'max_hbw_on_sample');
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
            $table->dropColumn([
                'min_hbw_on_the_component',
                'min_hbw_on_sample'
            ]);
            $table->renameColumn('max_hbw_on_the_component', 'hbw_on_the_component');
            $table->renameColumn('max_hbw_on_sample', 'hbw_on_sample');
        });
    }
};
