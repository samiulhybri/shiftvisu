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
            $table->double('min_value')->nullable();
            $table->double('max_value')->nullable();
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
            $table->dropColumn(['min_value', 'max_value']);
        });
    }
};
