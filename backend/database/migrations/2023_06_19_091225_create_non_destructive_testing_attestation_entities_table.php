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
        Schema::create('non_destructive_testing_attestation_entities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('non_destructive_testing_id')->constrained()->cascadeOnDelete()->index('fk_ndt_attestation_ndt_id');
            $table->string('attestation_entity');
            $table->index(['non_destructive_testing_id','attestation_entity'], 'non_destructive_testing_id_attestation_entity_index');
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
        Schema::dropIfExists('non_destructive_testing_attestation_entities');
    }
};
