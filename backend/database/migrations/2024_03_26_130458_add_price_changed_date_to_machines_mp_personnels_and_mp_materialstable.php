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
        Schema::table('machines', function (Blueprint $table) {
            $table->datetime('price_changed_date')->nullable();
        });
        Schema::table('mp_personnels', function (Blueprint $table) {
            $table->datetime('price_changed_date')->nullable();
        });
        Schema::table('mp_materials', function (Blueprint $table) {
            $table->datetime('price_changed_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropColumn('price_changed_date');
        });
        Schema::table('mp_personnels', function (Blueprint $table) {
            $table->dropColumn('price_changed_date');
        });
        Schema::table('mp_materials', function (Blueprint $table) {
            $table->dropColumn('price_changed_date');
        });
    }
};
