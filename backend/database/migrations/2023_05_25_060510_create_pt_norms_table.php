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
        Schema::create('pt_norms', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->string('specification')->nullable();
            $table->string('issue_revision_status')->nullable();
            $table->string('quality_class')->nullable();
            $table->string('test_scope')->nullable();
            $table->string('test_equipment')->nullable();
            $table->string('test_temperature')->nullable();
            $table->string('developer_serial_number')->nullable();
            $table->string('penetrant_serial_number')->nullable();
            $table->string('intermediate_cleaner')->nullable();
            $table->double('illuminance_lux')->nullable();
            $table->double('illuminance_meter')->nullable();
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
        Schema::dropIfExists('pt_norms');
    }
};
