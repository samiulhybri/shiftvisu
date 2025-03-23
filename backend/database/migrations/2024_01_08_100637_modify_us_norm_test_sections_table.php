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
            $table->string('registration_threshold_operator')->nullable();
            $table->string('reporting_threshold_operator')->nullable();
            $table->string('decision_threshold_operator')->nullable();
            $table->string('allowed_threshold_operator')->nullable();
            $table->string('expansion_with_operator')->nullable();
            $table->string('expansion_without_operator')->nullable();
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
                'registration_threshold_operator',
                'reporting_threshold_operator',
                'decision_threshold_operator',
                'allowed_threshold_operator',
                'expansion_with_operator',
                'expansion_without_operator'
            ]);
        });
    }
};
