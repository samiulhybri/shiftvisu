<?php

use App\Models\HweQsUsNorm;
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
        Schema::create('hwe_qs_us_norm_test_scopes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HweQsUsNorm::class)->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('hwe_qs_us_norm_test_scopes');
    }
};
