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
        Schema::table('us_norms', function (Blueprint $table) {
            $table->string('testing_device')->nullable();
            $table->string('shim')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('us_norms', function (Blueprint $table) {
            $table->dropColumn(['testing_device', 'shim']);
        });
    }
};
