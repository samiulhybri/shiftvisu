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
            $table->renameColumn('penetrant_serial_number', 'penetrant');
            $table->renameColumn('developer_serial_number', 'developer');
            $table->string('cleaner')->nullable();
            $table->double('registration_limit')->nullable();
            $table->string('control_unit')->nullable();
            $table->string('comments')->nullable();
            $table->string('lux_meter')->nullable();
            $table->dropColumn('illuminance_meter');
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
            $table->renameColumn('penetrant', 'penetrant_serial_number');
            $table->renameColumn('developer', 'developer_serial_number');
            $table->dropColumn(['cleaner', 'registration_limit', 'control_unit', 'comments', 'lux_meter']);
            $table->double('illuminance_meter')->nullable();
        });
    }
};
