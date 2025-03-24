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
        Schema::create('hwe_qs_cleanliness_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->string('cleanliness_specification')->nullable();
            $table->string('cleanliness_procedure')->nullable();
            $table->double('k1')->nullable();
            $table->double('k3')->nullable();
            $table->double('k4')->nullable();
            $table->double('ss')->nullable();
            $table->double('oa')->nullable();
            $table->double('os')->nullable();
            $table->double('og')->nullable();
            $table->double('fine_a')->nullable();
            $table->double('fine_b')->nullable();
            $table->double('fine_c')->nullable();
            $table->double('fine_d')->nullable();
            $table->double('ds')->nullable();
            $table->double('thick_a')->nullable();
            $table->double('thick_b')->nullable();
            $table->double('thick_c')->nullable();
            $table->double('thick_d')->nullable();
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
        Schema::dropIfExists('hwe_qs_cleanliness_tests');
    }
};
