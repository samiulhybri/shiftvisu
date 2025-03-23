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
        Schema::table('pt_norms', function (Blueprint $table) {
            $table->string('illuminance_lux')->nullable()->change();
            $table->string('registration_limit')->nullable()->change();
            $table->string('batch_developer')->nullable();
            $table->string('batch_penetrant')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('pt_norms', function (Blueprint $table) {
            $table->dropColumn(['illuminance_lux', 'registration_limit']);
        });

        Schema::table('pt_norms', function (Blueprint $table) {
            $table->double('illuminance_lux')->nullable();
            $table->double('registration_limit')->nullable();
            $table->dropColumn(['batch_developer', 'batch_penetrant']);
        });
    }
};
