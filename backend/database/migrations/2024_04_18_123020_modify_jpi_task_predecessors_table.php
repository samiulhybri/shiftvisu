<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('jpi_task_predecessors', function (Blueprint $table) {
            $table->foreignId('predecessor_jpi_task_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_task_predecessors', function (Blueprint $table) {
            $table->foreignId('predecessor_jpi_task_id')->nullable(false)->change();
        });
    }
};
