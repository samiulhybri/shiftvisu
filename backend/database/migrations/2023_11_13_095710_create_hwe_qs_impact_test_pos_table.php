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
        Schema::create('hwe_qs_impact_test_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hwe_qs_impact_test_id')->nullable()->constrained()->nullOnDelete();
            $table->double('temperature')->nullable();
            $table->double('value_1')->nullable();
            $table->double('value_2')->nullable();
            $table->double('value_3')->nullable();
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
        Schema::dropIfExists('hwe_qs_impact_test_pos');
    }
};
