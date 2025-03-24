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
        Schema::table('jpi_tasks', function (Blueprint $table) {
            $table->renameColumn('assigned_Resource1', 'assigned_resource1');
            $table->renameColumn('assigned_Resource2', 'assigned_resource2');
        });
    }
 
    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('jpi_tasks', function (Blueprint $table) {
            $table->renameColumn('assigned_resource1', 'assigned_Resource1');
            $table->renameColumn('assigned_resource2', 'assigned_Resource2');
        });
    }
};
 