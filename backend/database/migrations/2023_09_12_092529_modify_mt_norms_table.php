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
            $table->double('registration_limit')->nullable();
            $table->string('lux_meter')->nullable();
            $table->string('field_strength_meter')->nullable();
            $table->string('uv_meter')->nullable();
            $table->string('comments')->nullable();
            $table->string('residual_magnetism')->nullable();
            $table->string('control_unit')->nullable();
            $table->string('magnetization')->nullable()->change();
            $table->string('current_type')->nullable()->change();
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
            $table->dropColumn(['magnetization', 'current_type']);
        });

        Schema::table('mt_norms', function (Blueprint $table) {
            $table->dropColumn(['registration_limit', 'lux_meter', 'field_strength_meter', 'uv_meter', 'comments', 'residual_magnetism', 'control_unit']);
            $table->double('magnetization')->nullable();
            $table->double('current_type')->nullable();
        });
    }
};
