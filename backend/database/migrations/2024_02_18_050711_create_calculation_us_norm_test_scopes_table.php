<?php

use App\Models\CalculationUsNorm;
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
        Schema::create('calculation_us_norm_test_scopes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_us_norm_id');
            $table->foreign('calculation_us_norm_id', 'calculation_us_norm_id_foreign_test_scope')
                ->references('id')
                ->on('calculation_us_norms')
                ->cascadeOnDelete();
            $table->string('test_scope')->nullable();
            $table->string('probe')->nullable();
            $table->string('test_direction')->nullable();
            $table->double('sound_attenuation')->nullable();
            $table->string('sound_attenuation_operator')->nullable();
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
        Schema::dropIfExists('calculation_us_norm_test_scopes');
    }
};
