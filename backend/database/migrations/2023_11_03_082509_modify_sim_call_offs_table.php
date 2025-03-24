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
        Schema::table('sim_call_offs', function (Blueprint $table) {
            $table->index('date_monday');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sim_call_offs', function (Blueprint $table) {
            $table->dropIndex('sim_call_offs_date_monday_index');
        });
    }
};
