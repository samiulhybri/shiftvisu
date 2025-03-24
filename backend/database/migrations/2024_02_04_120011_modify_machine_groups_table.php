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
        Schema::table('machine_groups', function (Blueprint $table) {
            $table->boolean('auto_assign_machine')->default(false);
            $table->double('default_te')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machine_groups', function (Blueprint $table) {
            $table->dropColumn(['auto_assign_machine', 'default_te']);
        });
    }
};
