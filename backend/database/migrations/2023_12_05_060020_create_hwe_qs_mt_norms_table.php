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
        Schema::create('hwe_qs_mt_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->string('specification')->nullable();
            $table->string('revision')->nullable();
            $table->string('test_class')->nullable();
            $table->string('testing_facility')->nullable();
            $table->string('test_equipment')->nullable();
            $table->string('uv_lamp')->nullable();
            $table->string('test_range')->nullable();
            $table->string('magnetization')->nullable();
            $table->string('current_type')->nullable();
            $table->string('illuminance')->nullable();
            $table->string('irradiance')->nullable();
            $table->string('registration_limit')->nullable();
            $table->string('lux_meter')->nullable();
            $table->string('field_strength_meter')->nullable();
            $table->string('uv_meter')->nullable();
            $table->string('comments')->nullable();
            $table->string('residual_magnetism')->nullable();
            $table->string('control_unit')->nullable();
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
        Schema::dropIfExists('hwe_qs_mt_norms');
    }
};
