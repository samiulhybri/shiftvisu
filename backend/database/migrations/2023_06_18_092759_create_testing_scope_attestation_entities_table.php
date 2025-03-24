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
        Schema::create('testing_scope_attestation_entities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('testing_scope_id')->constrained()->cascadeOnDelete();
            $table->string('attestation_entity');
            $table->index(['testing_scope_id','attestation_entity'], 'testing_scope_id_attestation_entity_index');
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
        Schema::dropIfExists('testing_scope_attestation_entities');
    }
};
