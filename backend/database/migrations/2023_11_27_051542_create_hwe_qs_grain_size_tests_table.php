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
        Schema::create('hwe_qs_grain_size_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->string('grain_size_specification')->nullable();
            $table->string('grain_size_procedure')->nullable();
            $table->string('grain_size_testing_scope')->nullable();
            $table->string('grain_size_testing_operator')->nullable();
            $table->double('value')->nullable();
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
        Schema::dropIfExists('hwe_qs_grain_size_tests');
    }
};
