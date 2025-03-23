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
        Schema::table('operation_plan_pos', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->double('te')->nullable()->default(null)->change();
            $table->double('tr')->nullable()->default(null)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('operation_plan_pos', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
            $table->double('te')->nullable(false)->default(0)->change();
            $table->double('tr')->nullable(false)->default(0)->change();
        });
    }
};
