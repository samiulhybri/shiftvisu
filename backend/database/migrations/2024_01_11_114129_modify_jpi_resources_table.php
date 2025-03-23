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
        Schema::table('jpi_resources', function (Blueprint $table) {
            $table->string('name')->nullable();
            $table->double('capacity')->default(1);
            $table->boolean('disabled')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_resources', function (Blueprint $table) {
            $table->dropColumn(['name','capacity','disabled']);
        });
    }
};
