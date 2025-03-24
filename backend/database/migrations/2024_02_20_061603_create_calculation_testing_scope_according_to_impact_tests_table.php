<?php

use App\Models\Calculation;
use App\Models\CalculationTestingScope;
use App\Models\TestingScopeAccordingToImpactTest;
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
        Schema::create('calculation_testing_scope_according_to_impact_tests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_testing_scope_id');
            $table->foreign('calculation_testing_scope_id', 'calculation_testing_scope_id_foreign_for_impact_test')
                ->references('id')
                ->on('calculation_testing_scopes')
                ->cascadeOnDelete();
            $table->string('according_to_impact_test');
            $table->index(['calculation_testing_scope_id', 'according_to_impact_test'], 'calculation_testing_scope_id_index_unique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.p2024_02_20_061628_create_calculation_testing_scope_according_to_tensile_tests_table
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('calculation_testing_scope_according_to_impact_tests');
    }
};
