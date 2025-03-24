<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\JpiJobOrderStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('jpi_jobs', function (Blueprint $table) {
            $table->id();
            $table->morphs('model');
            $table->string('jpi_guid')->nullable();
            $table->string('name')->nullable();
            $table->dateTime('due_date')->nullable();
            $table->dateTime('release_date')->nullable();
            $table->string('order_status')->default(JpiJobOrderStatus::QUOTED());
            $table->integer('quantity')->default(0);
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
            $table->boolean('automatic')->default(true);
            $table->string('job_note')->nullable();
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
        Schema::dropIfExists('jpi_jobs');
    }
};
