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
        Schema::table('absence_requests', function (Blueprint $table) {
            //
            $table->text('applicant_note')->nullable()->change();
            $table->text('supervisor_note')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('absence_requests', function (Blueprint $table) {
            //
            $table->string('applicant_note')->nullable()->change();
            $table->string('supervisor_note')->nullable()->change();
        });
    }
};
