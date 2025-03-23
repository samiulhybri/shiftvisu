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
        Schema::create('jpi_resource_resource_groups', function (Blueprint $table) {
            $table->foreignId('jpi_resource_id')->constrained()->cascadeOnDelete();
            $table->foreignId('jpi_resource_group_id')->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jpi_resource_resource_groups');
    }
};
