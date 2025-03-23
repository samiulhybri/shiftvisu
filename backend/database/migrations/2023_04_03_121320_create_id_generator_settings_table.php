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
        Schema::create('id_generator_settings', function (Blueprint $table) {
            $table->id();
            $table->string('entity')->unique();
            $table->string('table');
            $table->string('prefix');
            $table->string('field');
            $table->integer('length')->default(8);
            $table->boolean('reset_on_prefix_change')->default(true);
            $table->boolean('is_date_prefix')->default(false);
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
        Schema::dropIfExists('id_generator_settings');
    }
};
