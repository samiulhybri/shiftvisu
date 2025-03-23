<?php

use App\Models\Model\JpiResource;
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
            $table->dropColumn(['assigned_resource1', 'assigned_resource2', 'processing_resource1', 'processing_resource2', 'processing_resource_group1', 'processing_resource_group2']);
        });

        Schema::table('jpi_tasks', function (Blueprint $table) {

            $table->unsignedBigInteger('assigned_resource1')->nullable();
            $table->foreign('assigned_resource1', 'jpi_tasks_assigned_resource1')
                ->references('id')
                ->on('jpi_resources')
                ->nullOnDelete();

            $table->unsignedBigInteger('assigned_resource2')->nullable();
            $table->foreign('assigned_resource2', 'jpi_tasks_assigned_resource2')
                ->references('id')
                ->on('jpi_resources')
                ->nullOnDelete();

            $table->unsignedBigInteger('processing_resource1')->nullable();
            $table->foreign('processing_resource1', 'jpi_tasks_processing_resource1')
                ->references('id')
                ->on('jpi_resources')
                ->nullOnDelete();

            $table->unsignedBigInteger('processing_resource2')->nullable();
            $table->foreign('processing_resource2', 'jpi_tasks_processing_resource2')
                ->references('id')
                ->on('jpi_resources')
                ->nullOnDelete();

            $table->unsignedBigInteger('processing_resource_group1')->nullable();
            $table->foreign('processing_resource_group1', 'jpi_tasks_processing_resource_group1')
                ->references('id')
                ->on('jpi_resource_groups')
                ->nullOnDelete();

            $table->unsignedBigInteger('processing_resource_group2')->nullable();
            $table->foreign('processing_resource_group2', 'jpi_tasks_processing_resource_group2')
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
            $table->dropForeign('jpi_tasks_assigned_resource1');
            $table->dropForeign('jpi_tasks_assigned_resource2');
            $table->dropForeign('jpi_tasks_processing_resource1');
            $table->dropForeign('jpi_tasks_processing_resource2');
            $table->dropForeign('jpi_tasks_processing_resource_group1');
            $table->dropForeign('jpi_tasks_processing_resource_group2');

            $table->dropColumn(['assigned_resource1', 'assigned_resource2', 'processing_resource1', 'processing_resource2', 'processing_resource_group1', 'processing_resource_group2']);
        });

        Schema::table('jpi_tasks', function (Blueprint $table) {
            $table->string('assigned_resource1')->nullable();
            $table->string('assigned_resource2')->nullable();
            $table->string('processing_resource1')->nullable();
            $table->string('processing_resource2')->nullable();
            $table->string('processing_resource_group1')->nullable();
            $table->string('processing_resource_group2')->nullable();
        });
    }
};
