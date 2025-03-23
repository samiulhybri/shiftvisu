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
        Schema::create('vt_norm_test_techniques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vt_norm_id')->constrained()->cascadeOnDelete();
            $table->string('test_technique');
            $table->index(['vt_norm_id','test_technique']);
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
        Schema::dropIfExists('vt_norm_test_techniques');
    }
};
