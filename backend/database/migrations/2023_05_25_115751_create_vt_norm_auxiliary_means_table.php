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
        Schema::create('vt_norm_auxiliary_means', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vt_norm_id')->constrained()->cascadeOnDelete();
            $table->string('auxiliary_mean');
            $table->index(['vt_norm_id','auxiliary_mean']);
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
        Schema::dropIfExists('vt_norm_auxiliary_means');
    }
};
