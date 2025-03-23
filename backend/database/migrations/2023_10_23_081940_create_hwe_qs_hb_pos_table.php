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
        Schema::create('hwe_qs_hb_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hwe_qs_hb_id')->nullable()->constrained()->nullOnDelete();
            $table->string('serial')->nullable();
            $table->string('position')->nullable();
            $table->double('measurement')->nullable();
            $table->string('checkpoint')->nullable();
            $table->double('value')->nullable();
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
        Schema::dropIfExists('hwe_qs_hb_pos');
    }
};
