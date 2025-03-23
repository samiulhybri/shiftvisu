<?php

use App\Models\Calculation;
use App\Models\ResidualMaterial;
use App\Models\VtNorm;
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
        Schema::create('calculation_vt_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Calculation::class)->unique()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(VtNorm::class)->constrained()->cascadeOnDelete();
            $table->string('name')->nullable();
            $table->string('specification')->nullable();
            $table->string('revision')->nullable();
            $table->string('quality_class')->nullable();
            $table->string('test_scope')->nullable();
            $table->string('illuminance')->nullable();
            $table->string('registration_limit')->nullable();
            $table->string('surface_quality')->nullable();
            $table->string('lux_meter')->nullable();
            $table->string('comments')->nullable();
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
        Schema::dropIfExists('calculation_vt_norms');
    }
};
