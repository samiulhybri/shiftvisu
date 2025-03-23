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
        Schema::table('machines',function (Blueprint $table) {
            $table->boolean('is_furnace')->default(false);
            $table->boolean('is_casting_machine')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machines',function (Blueprint $table) {
            $table->dropColumn('is_furnace');
            $table->dropColumn('is_casting_machine');
        });
    }
};
