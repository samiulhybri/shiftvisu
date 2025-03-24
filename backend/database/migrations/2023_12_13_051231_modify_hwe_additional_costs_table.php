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
            // Drop the unique constraint on 'hwe_cast_type'
            $table->dropUnique(['hwe_cast_type']);

            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_to')->nullable();
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
            $table->dropColumn('valid_from');
            $table->dropColumn('valid_to');
            $table->unique('hwe_cost_type');
        });
    }
};
