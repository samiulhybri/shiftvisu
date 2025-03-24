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
        Schema::table('jpi_tasks', function (Blueprint $table) {
            $table->dateTime('processing_start')->nullable();
            $table->double('send_ahead_quantity')->default(0)->nullable()->change();
            $table->string('processing_resource_group1')->nullable();
            $table->string('processing_resource_group2')->nullable();
            $table->string('processing_resource1')->nullable();
            $table->string('processing_resource2')->nullable();

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
            $table->dropColumn([
                'processing_start',
                'processing_resource_group1',
                'processing_resource_group2',
                'processing_resource1',
                'processing_resource2'
            ]);
            $table->integer('send_ahead_quantity')->default(0)->change();
        });
    }
};
