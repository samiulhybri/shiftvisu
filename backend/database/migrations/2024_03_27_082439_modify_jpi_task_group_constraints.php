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
        Schema::table('jpi_task_resource_group_constraints', function (Blueprint $table) {
            $table->double('usage_factor')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_task_resource_group_constraints', function (Blueprint $table) {
            $table->dropColumn(['usage_factor']);
        });
    }
};
