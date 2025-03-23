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
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->string('custom_id')->unique();
            $table->string('name');
            $table->double('usage_factor')->default(1);
            $table->foreignId('hall_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('machine_group_id')->nullable()->constrained()->nullOnDelete();
            $table->double('tr')->default(0);
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
        Schema::dropIfExists('machines');
    }
};
