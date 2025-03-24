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
        Schema::create('mt_norm_control_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mt_norm_id')->constrained()->cascadeOnDelete();
            $table->string('control_unit');
            $table->index(['mt_norm_id','control_unit']);
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
        Schema::dropIfExists('mt_norm_control_units');
    }
};
