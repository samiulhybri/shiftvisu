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
        Schema::table('data_import', function (Blueprint $table) {
            $table->rename('data_imports');
        });
        Schema::table('data_export', function (Blueprint $table) {
            $table->rename('data_exports');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('data_imports', function (Blueprint $table) {
            $table->rename('data_import');
        });
        Schema::table('data_exports', function (Blueprint $table) {
            $table->rename('data_export');
        });
    }
};
