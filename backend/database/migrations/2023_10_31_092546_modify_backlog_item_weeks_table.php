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
        Schema::table('backlog_item_weeks', function (Blueprint $table) {
            $table->index('backlog_item_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('backlog_item_weeks', function (Blueprint $table) {
            $table->dropIndex('backlog_item_weeks_backlog_item_id_index');
        });
    }
};
