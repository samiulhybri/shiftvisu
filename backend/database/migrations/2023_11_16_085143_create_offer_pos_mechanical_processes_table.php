<?php

use App\Models\OfferPos;
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
        Schema::create('offer_pos_mechanical_processes', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(OfferPos::class)->constrained()->cascadeOnDelete();
            $table->integer('section');
            $table->double('outer_diameter')->nullable();
            $table->double('inner_diameter')->nullable();
            $table->double('length')->nullable();
            $table->string('tolerance')->nullable();
            $table->double('radius')->nullable();
            $table->double('oblique')->nullable();
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
        Schema::dropIfExists('offer_pos_mechanical_processes');
    }
};
