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
        Schema::create('jpi_task_resource_group_constraint_resource_constraints', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('jpi_task_resource_group_constraint_id');
            $table->unsignedBigInteger('jpi_resource_id');
            $table->foreign('jpi_task_resource_group_constraint_id', 'jpi_task_resource_group_constraint_id_foreign')
                ->references('id')
                ->on('jpi_task_resource_group_constraints')
                ->cascadeOnDelete();
            $table->foreign('jpi_resource_id', 'jpi_resource_id_foreign')
                ->references('id')
                ->on('jpi_resources')
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
        Schema::dropIfExists('jpi_task_resource_group_constraint_resource_constraints');
    }
};
