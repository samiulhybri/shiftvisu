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
        Schema::create('jpi_resource_groups', function (Blueprint $table) {
            $table->id();
            $table->string('jpi_guid')->nullable();
            $table->morphs('model');
            $table->foreignId('jpi_resource_category_id')->references('id')->on('jpi_resource_categories')->cascadeOnDelete();
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
        Schema::dropIfExists('jpi_resource_groups');
    }
};
