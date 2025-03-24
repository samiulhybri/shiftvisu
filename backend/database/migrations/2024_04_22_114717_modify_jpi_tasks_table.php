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
            $table->string('assigned_Resource1')->nullable();
            $table->string('assigned_Resource2')->nullable();
            $table->dateTime('planned_start')->nullable();
            $table->dateTime('planned_end')->nullable();
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
            $table->dropColumn([
                'assigned_Resource1',
                'assigned_Resource2',
                'planned_start',
                'planned_end'
            ]);
        });
    }
};
