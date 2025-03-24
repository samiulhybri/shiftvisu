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
        Schema::create('non_destructive_testings', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name')->nullable();
            $table->string('non_destructive_testing')->nullable();
            $table->string('ultrasound_standard')->nullable();
            $table->string('ultrasound_output')->nullable();
            $table->string('ultrasound_test_scope')->nullable();
            $table->string('ultrasound_test_range')->nullable();
            $table->double('ultrasound_efg_max')->nullable();
            $table->double('ultrasound_test_duration')->nullable();
            $table->boolean('ultrasound_attenuation')->default(false);
            $table->string('ultrasound_details')->nullable();
            $table->double('max_residual_field_strength')->nullable();
            $table->string('max_residual_field_strength_unit')->nullable();
            $table->string('surface_crack_test_method')->nullable();
            $table->string('surface_crack_standard')->nullable();
            $table->string('surface_crack_output')->nullable();
            $table->string('surface_crack_test_criteria')->nullable();
            $table->string('surface_crack_audit_scope')->nullable();
            $table->double('surface_crack_test_duration')->nullable();
            $table->string('surface_crack_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('non_destructive_testings');
    }
};
