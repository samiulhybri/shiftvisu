<?php

use App\Models\Calculation;
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
        Schema::create('calculation_testing_scope_attestation_entities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_testing_scope_id');
            $table->foreign('calculation_testing_scope_id', 'calculation_testing_scope_id_foreignentities')
                ->references('id')
                ->on('calculation_testing_scopes')
                ->cascadeOnDelete();
            $table->string('attestation_entity');
            $table->index(['calculation_testing_scope_id', 'attestation_entity'], 'calculation_testing_scope_id_index_entitiesunique');
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
        Schema::dropIfExists('calculation_testing_scope_attestation_entities');
    }
};
