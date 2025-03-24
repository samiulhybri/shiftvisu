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
        Schema::create('non_destructive_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\NonDestructiveTesting::class)->unique()->constrained()->cascadeOnDelete();
            $table->morphs('norm');
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
        Schema::dropIfExists('non_destructive_norms');
    }
};
