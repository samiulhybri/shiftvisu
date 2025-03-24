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
        Schema::create('jpi_task_assigned_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Model\JpiTask::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(\App\Models\Model\JpiResource::class)->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('jpi_task_assigned_resources');
    }
};
