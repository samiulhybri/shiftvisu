<?php

use App\Models\Calculation;
use App\Models\ResidualMaterial;
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
        Schema::create('calculation_residual_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Calculation::class)->unique()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ResidualMaterial::class)->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('specification')->nullable();
            $table->string('revision')->nullable();
            $table->string('quantity_sample_geometries')->nullable();
            $table->string('free_text')->nullable();
            $table->string('marking')->nullable();
            $table->string('frequency')->nullable();
            $table->string('cross_section_type')->nullable();
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
        Schema::dropIfExists('calculation_residual_materials');
    }
};
