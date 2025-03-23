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
        Schema::create('calculation_testing_scope_melting_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_testing_scope_id');
            $table->foreign('calculation_testing_scope_id', 'fk_melting_type_scope')
            ->references('id')
            ->on('calculation_testing_scopes')
            ->cascadeOnDelete();
            $table->string('melting_type');
            $table->index(['calculation_testing_scope_id','melting_type'], 'calculation_testing_scope_melting_types_id_unique');
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
        Schema::dropIfExists('calculation_testing_scope_melting_types');
    }
};
