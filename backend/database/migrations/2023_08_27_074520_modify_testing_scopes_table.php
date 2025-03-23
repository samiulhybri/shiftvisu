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
            $table->dropColumn(['tensile_test_warm_temperature']);
        });

        Schema::table('testing_scopes', function (Blueprint $table) {
            $table->double('tensile_test_warm_temperature')->nullable();
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
            $table->string('tensile_test_warm_temperature')->nullable()->change();
        });
    }
};
