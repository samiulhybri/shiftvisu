<?php

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
        Schema::create('hwe_qs_vt_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->boolean('is_ok')->default(false);
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
        Schema::dropIfExists('hwe_qs_vt_norms');
    }
};
