<?php

use App\Enums\UsNormAmplification;
use App\Enums\UsNormCoupling;
use App\Models\ProdOrderPos;
use App\Models\ProdOrderPosOperation;
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
        Schema::create('hwe_qs_us_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->string('issue')->nullable();
            $table->string('quality_class')->nullable();
            $table->string('surface_finish')->nullable();
            $table->string('coupling')->default(UsNormCoupling::PASTE());
            $table->string('amplification')->default(UsNormAmplification::AVG());
            $table->double('detection_threshold')->nullable();
            $table->double('residual_magnetism')->nullable();
            $table->string('detection_threshold_operator')->nullable();
            $table->string('note')->nullable();
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
        Schema::dropIfExists('hwe_qs_us_norms');
    }
};
