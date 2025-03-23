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
        Schema::table('mt_norms', function (Blueprint $table) {
            $table->string('registration_limit')->nullable()->change();
            $table->string('illuminance')->nullable()->change();
            $table->string('irradiance')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mt_norms', function (Blueprint $table) {
            $table->dropColumn(['illuminance', 'irradiance', 'registration_limit']);
        });

        Schema::table('mt_norms', function (Blueprint $table) {
            $table->double('registration_limit')->nullable();
            $table->double('illuminance')->nullable();
            $table->double('irradiance')->nullable();
        });
    }
};
