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
        Schema::table('jpi_tasks', function (Blueprint $table) {
            $table->dropColumn(['model']);
            $table->morphs('model');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_tasks', function (Blueprint $table) {
            $table->dropMorphs('model');
            $table->string('model')->nullable();
        });
    }
};
