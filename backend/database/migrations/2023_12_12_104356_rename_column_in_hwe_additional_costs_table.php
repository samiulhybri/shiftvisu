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
        Schema::table('hwe_additional_costs', function (Blueprint $table) {
            $table->renameColumn('hwe_cast_type', 'hwe_cost_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hwe_additional_costs', function (Blueprint $table) {
            $table->renameColumn('hwe_cost_type', 'hwe_cast_type');
        });
    }
};
