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
            $table->unsignedBigInteger('assigned_resource_group1')->nullable();
            $table->foreign('assigned_resource_group1', 'jpi_tasks_assigned_resource_group1')
                ->references('id')
                ->on('jpi_resource_groups')
                ->nullOnDelete();

            $table->unsignedBigInteger('assigned_resource_group2')->nullable();
            $table->foreign('assigned_resource_group2', 'jpi_tasks_assigned_resource_group2')
                ->references('id')
                ->on('jpi_resource_groups')
                ->nullOnDelete();
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
            $table->dropForeign('jpi_tasks_assigned_resource_group1');
            $table->dropForeign('jpi_tasks_assigned_resource_group2');

            $table->dropColumn(['assigned_resource_group1', 'assigned_resource_group2']);
        });
    }
};
