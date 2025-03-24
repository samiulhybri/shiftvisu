<?php

use App\Models\Calculation;
use App\Models\MtNorm;
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
        Schema::dropIfExists('calculation_mt_norms');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('calculation_mt_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MtNorm::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Calculation::class)->unique()->constrained()->cascadeOnDelete();
            $table->string('specification')->default(false);
            $table->string('revision')->default(false);
            $table->string('test_class')->default(false);
            $table->string('testing_facility')->default(false);
            $table->string('test_equipment')->default(false);
            $table->string('uv_lamp')->default(false);
            $table->string('test_range')->default(false);
            $table->string('magnetization')->default(false);
            $table->string('current_type')->default(false);
            $table->string('illuminance')->default(false);
            $table->string('irradiance')->default(false);
            $table->string('registration_limit')->default(false);
            $table->string('lux_meter')->default(false);
            $table->string('field_strength_meter')->default(false);
            $table->string('uv_meter')->default(false);
            $table->string('comments')->default(false);
            $table->string('residual_magnetism')->default(false);
            $table->string('control_unit')->default(false);
            $table->timestamps();
        });
    }
};
