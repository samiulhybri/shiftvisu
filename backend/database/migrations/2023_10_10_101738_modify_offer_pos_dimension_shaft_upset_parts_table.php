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
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->string('type')->nullable()->change();
            $table->integer('section')->nullable()->change();
            $table->integer('height')->nullable()->change();
            $table->double('outer_diameter')->nullable()->change();
        });
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->renameColumn("height", "length");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->string('type')->nullable(false)->change();
            $table->integer('section')->nullable(false)->change();
            $table->integer('length')->nullable(false)->change();
            $table->double('outer_diameter')->nullable(false)->change();
        });
        Schema::table('offer_pos_dimension_shaft_upset_parts', function (Blueprint $table) {
            $table->renameColumn("length", "height");
        });
    }
};
