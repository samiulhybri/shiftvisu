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
        Schema::create('us_norm_test_directions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('us_norm_id')->constrained()->cascadeOnDelete();
            $table->string('test_direction');
            $table->index(['us_norm_id','test_direction']);
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
        Schema::dropIfExists('us_norm_test_directions');
    }
};
