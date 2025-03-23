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
        Schema::table('us_norm_test_scopes', function (Blueprint $table) {
            $table->string('sound_attenuation_operator')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('us_norm_test_scopes', function (Blueprint $table) {
            $table->dropColumn('sound_attenuation_operator');
        });
    }
};
