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
        Schema::table('bad_part_reason_machines', function (Blueprint $table) {
            $table->dropForeign(['bad_part_reason_id']);
            $table->dropForeign(['machine_id']);
            $table->dropUnique('machine_id');
            $table->foreign('bad_part_reason_id')->on('bad_part_reasons')->references('id')->cascadeOnDelete();
            $table->foreign('machine_id')->on('machines')->references('id')->cascadeOnDelete();
            $table->unique(['bad_part_reason_id', 'machine_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bad_part_reason_machines', function (Blueprint $table) {
            $table->dropForeign(['bad_part_reason_id']);
            $table->dropForeign(['machine_id']);
            $table->dropUnique(['bad_part_reason_id', 'machine_id']);
            $table->foreign('bad_part_reason_id')->on('bad_part_reasons')->references('id')->cascadeOnDelete();
            $table->foreign('machine_id')->on('machines')->references('id')->cascadeOnDelete();
            $table->unique('bad_part_reason_id', 'machine_id');
        });
    }
};
