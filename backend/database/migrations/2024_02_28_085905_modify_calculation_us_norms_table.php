<?php

use App\Enums\UsNormAmplification;
use App\Enums\UsNormCoupling;
use App\Models\Calculation;
use App\Models\UsNorm;
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
        Schema::table('calculation_us_norms', function (Blueprint $table) {
            Schema::dropIfExists('calculation_us_norms');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('calculation_us_norms', function (Blueprint $table) {
            Schema::create('calculation_us_norms', function (Blueprint $table) {
                $table->id();
                $table->foreignIdFor(Calculation::class)->unique()->constrained()->cascadeOnDelete();
                $table->foreignIdFor(UsNorm::class)->constrained()->cascadeOnDelete();
                $table->string('specification')->nullable();
                $table->string('issue')->nullable();
                $table->string('quality_class')->nullable();
                $table->string('surface_finish')->nullable();
                $table->string('coupling')->default(UsNormCoupling::PASTE());
                $table->string('amplification')->default(UsNormAmplification::AVG());
                $table->string('name')->nullable();
                $table->double('detection_threshold')->nullable();
                $table->double('residual_magnetism')->nullable();
                $table->string('detection_threshold_operator')->nullable();
                $table->string('note')->nullable();
                $table->string('testing_device')->nullable();
                $table->string('shim')->nullable();
                $table->string('test_of_scope')->nullable();
                $table->double('sound_attenuation')->nullable();
                $table->timestamps();
            });
        });
    }
};
