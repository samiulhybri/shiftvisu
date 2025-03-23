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
        Schema::create('residual_materials', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->string('specification')->nullable();
            $table->string('issue_revision_status')->nullable();
            $table->string('quantity_sample_geometries')->nullable();
            $table->string('free_text')->nullable();
            $table->boolean('per_component')->default(false);
            $table->boolean('stamping_samples')->default(false);
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
        Schema::dropIfExists('residual_materials');
    }
};
