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
        Schema::create('calculation_testing_scope_classified_bies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_testing_scope_id');
            $table->foreign('calculation_testing_scope_id', 'calculation_testing_scope_classified_bies_cts_id')
            ->references('id')
            ->on('calculation_testing_scopes')
            ->cascadeOnDelete();
            $table->string('classified_by');
            $table->index(['calculation_testing_scope_id','classified_by'], 'cts_melting_types_id_and_classified_by_unique');
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
        Schema::dropIfExists('calculation_testing_scope_classified_bies');
    }
};
