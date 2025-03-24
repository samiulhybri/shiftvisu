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
        Schema::create('documentation_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('documentation_id')->constrained()->cascadeOnDelete();
            $table->string('certificate');
            $table->index(['documentation_id','certificate']);
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
        Schema::dropIfExists('documentation_certificates');
    }
};
