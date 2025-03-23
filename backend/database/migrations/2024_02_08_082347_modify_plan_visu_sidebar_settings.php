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
        Schema::dropIfExists('plan_visu_sidebar_settings');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('plan_visu_sidebar_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_showed');
            $table->timestamps();
        });
    }
};
