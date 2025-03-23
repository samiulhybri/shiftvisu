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
        Schema::table('calculation_us_norm_test_sections', function (Blueprint $table) {
            Schema::dropIfExists('calculation_us_norm_test_sections');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculation_us_norm_test_sections', function (Blueprint $table) {
            Schema::create('calculation_us_norm_test_sections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('calculation_us_norm_id')->constrained()->cascadeOnDelete();
                $table->string('test_section')->nullable();
                $table->double('registration_threshold')->nullable();
                $table->double('reporting_threshold')->nullable();
                $table->double('decision_threshold')->nullable();
                $table->double('allowed_threshold')->nullable();
                $table->double('expansion_with')->nullable();
                $table->double('expansion_without')->nullable();
                $table->string('registration_threshold_operator')->nullable();
                $table->string('reporting_threshold_operator')->nullable();
                $table->string('decision_threshold_operator')->nullable();
                $table->string('allowed_threshold_operator')->nullable();
                $table->string('expansion_with_operator')->nullable();
                $table->string('expansion_without_operator')->nullable();
                $table->timestamps();
            });
        });
    }
};
