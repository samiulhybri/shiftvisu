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
        Schema::table('jpi_task_resource_group_constraint_resource_constraints', function (Blueprint $table) {
            $table->double('resource_usage')->default(1)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_task_resource_group_constraint_resource_constraints', function (Blueprint $table) {
            $table->dropColumn('resource_usage');
        });
    }
};
