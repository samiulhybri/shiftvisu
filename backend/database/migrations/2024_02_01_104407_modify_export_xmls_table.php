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
        Schema::table('export_xmls', function (Blueprint $table) {
            $table->rename('data_export');
        });

        Schema::table('data_export', function (Blueprint $table) {
            $table->string('name', 255)->after('data');
            $table->boolean('is_exported')->default(0)->after('name');
            $table->index('name');
            $table->index('is_exported');
        });
    }
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('data_export', function (Blueprint $table) {
            $table->dropIndex('data_export_name_index');
            $table->dropIndex('data_export_is_exported_index');
            $table->dropColumn('name');
            $table->dropColumn('is_exported');
            $table->rename('export_xmls');
        });
    }
};
