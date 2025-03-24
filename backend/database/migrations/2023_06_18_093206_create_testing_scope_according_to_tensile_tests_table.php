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
        Schema::create('testing_scope_according_to_tensile_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('testing_scope_id')->constrained()->cascadeOnDelete()->index('fk_ts_according_to_tensile_test_ts_id');
            $table->string('according_to_tensile_test');
            $table->index(['testing_scope_id','according_to_tensile_test'], 'testing_scope_id_according_to_tensile_test_index');
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
        Schema::dropIfExists('testing_scope_according_to_tensile_tests');
    }
};
