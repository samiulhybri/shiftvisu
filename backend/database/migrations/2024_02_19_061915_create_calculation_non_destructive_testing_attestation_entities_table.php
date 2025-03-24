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
        Schema::create('calculation_non_destructive_testing_attestation_entities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_non_destructive_testing_id');
            $table->foreign('calculation_non_destructive_testing_id', 'calculation_non_destructive_testing_id_foreign')
                ->references('id')
                ->on('calculation_non_destructive_testings')
                ->cascadeOnDelete();
            $table->string('attestation_entity');
            $table->index(['calculation_non_destructive_testing_id', 'attestation_entity'], 'calculation_documentation_attestation_entity_unique_index');
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
        Schema::dropIfExists('calculation_non_destructive_testing_attestation_entities');
    }
};
