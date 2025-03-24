<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\UsNormCoupling;
use \App\Enums\UsNormAmplification;
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('us_norms', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('specification')->nullable();
            $table->string('issue')->nullable();
            $table->string('quality_class')->nullable();
            $table->string('surface_finish')->nullable();
            $table->string('coupling')->default(UsNormCoupling::PASTE());
            $table->string('amplification')->default(UsNormAmplification::AVG());
            $table->string('test_of_scope')->nullable();
            $table->double('sound_attenuation')->nullable();
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
        Schema::dropIfExists('us_norms');
    }
};
