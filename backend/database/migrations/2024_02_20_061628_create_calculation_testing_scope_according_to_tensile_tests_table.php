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
        Schema::create('calculation_testing_scope_according_to_tensile_tests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_testing_scope_id');
            $table->foreign('calculation_testing_scope_id', 'calculation_testing_scope_id_foreign_for_tensile_tests')
                ->references('id')
                ->on('calculation_testing_scopes')
                ->cascadeOnDelete();
            $table->string('according_to_tensile_test');
            $table->index(['calculation_testing_scope_id', 'according_to_tensile_test'], 'calculation_testing_scope_id_tensile_testsindex_unique');
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
        Schema::dropIfExists('calculation_testing_scope_according_to_tensile_tests');
    }
};
