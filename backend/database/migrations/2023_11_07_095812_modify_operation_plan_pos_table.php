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
        Schema::table('operation_plan_pos', function (Blueprint $table) {
            $table->foreignId('machine_group_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
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
            $table->dropForeign(['machine_group_id']);
            $table->dropColumn(['machine_group_id']);
        });
    }
};
