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
        Schema::table('offer_pos_mechanical_processes', function (Blueprint $table) {
            $table->dropColumn('oblique');
            $table->double('side')->nullable();
            $table->double('inner_length')->nullable();
            $table->double('inner_radius')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_mechanical_processes', function (Blueprint $table) {
            $table->double('oblique')->nullable();
            $table->dropColumn(['side', 'inner_length', 'inner_radius']);
        });
    }
};
