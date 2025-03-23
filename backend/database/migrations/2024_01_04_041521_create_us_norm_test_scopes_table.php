<?php

use App\Models\UsNorm;
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
        Schema::create('us_norm_test_scopes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(UsNorm::class)->constrained()->cascadeOnDelete();
            $table->string('test_scope')->nullable();
            $table->string('probe')->nullable();
            $table->string('test_direction')->nullable();
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
        Schema::dropIfExists('us_norm_test_scopes');
    }
};
