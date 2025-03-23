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
        Schema::create('jpi_tasks', function (Blueprint $table) {
            $table->id();
            $table->string('model')->nullable();
            $table->string('jpi_guid')->nullable();
            $table->string('task_no')->nullable();
            $table->string('name')->nullable();
            $table->double('production_time_per_unit')->default(0);
            $table->integer('quantity')->default(0);
            $table->integer('total_done_quantity')->default(0);
            $table->string('custom_field_value_1')->nullable();
            $table->string('custom_field_value_2')->nullable();
            $table->string('custom_field_value_3')->nullable();
            $table->string('custom_field_value_4')->nullable();
            $table->string('custom_field_value_5')->nullable();
            $table->string('custom_field_value_6')->nullable();
            $table->string('custom_field_value_7')->nullable();
            $table->string('custom_field_value_8')->nullable();
            $table->string('custom_field_value_9')->nullable();
            $table->string('custom_field_value_10')->nullable();
            $table->double('setup_time')->default(0);
            $table->integer('teardown_time')->default(0);
            $table->integer('transfer_time')->default(0);
            $table->dateTime('start_not_earlier_than')->nullable();
            $table->integer('send_ahead_quantity')->default(0);
            $table->integer('shopfloor_total_done_quantity')->default(0);
            $table->dateTime('processing_end')->nullable();
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
        Schema::dropIfExists('jpi_tasks');
    }
};
