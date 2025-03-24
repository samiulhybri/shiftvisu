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
        Schema::table('us_norm_test_sections', function (Blueprint $table) {
            $table->double('scrap_limit')->nullable();
            $table->string('scrap_limit_operator')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('us_norm_test_sections', function (Blueprint $table) {
            $table->dropColumn([
                'scrap_limit',
                'scrap_limit_operator'
            ]);
        });
    }
};
