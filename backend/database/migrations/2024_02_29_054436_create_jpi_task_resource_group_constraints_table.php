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
        Schema::create('jpi_task_resource_group_constraints', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jpi_task_id');
            $table->unsignedBigInteger('jpi_resource_group_id');
            $table->foreign('jpi_task_id', 'jpi_task_id_foreign')
                ->references('id')
                ->on('jpi_tasks')
                ->cascadeOnDelete();
            $table->foreign('jpi_resource_group_id', 'jpi_resource_group_id_foreign')
                ->references('id')
                ->on('jpi_resource_groups')
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jpi_task_resource_group_constraints');
    }
};
