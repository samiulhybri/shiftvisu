<?php

use App\Models\CalculationTestingScope;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calculation_testing_scope_sample_depths', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('calculation_testing_scope_id');
            $table->foreign('calculation_testing_scope_id', 'fk_scope_sample_depth')
                ->references('id')
                ->on('calculation_testing_scopes')
                ->cascadeOnDelete();
            $table->string('sample_depth');
            $table->unique(['calculation_testing_scope_id', 'sample_depth'], 'calculation_testing_scope_sample_depth_unique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculation_testing_scope_sample_depths');
    }
};
