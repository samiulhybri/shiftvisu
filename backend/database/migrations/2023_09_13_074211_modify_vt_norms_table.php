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
        Schema::table('vt_norms', function (Blueprint $table) {
            $table->string('registration_limit')->nullable();
            $table->string('surface_quality')->nullable();
            $table->string('lux_meter')->nullable();
            $table->string('comments')->nullable();
            $table->dropColumn('test_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('vt_norms', function (Blueprint $table) {
            $table->dropColumn(['registration_limit', 'surface_quality', 'lux_meter', 'comments']);
            $table->string('test_type')->nullable();
        });
    }
};
