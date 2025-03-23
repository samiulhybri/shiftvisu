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
        Schema::create('hwe_qs_pt_norms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ProdOrderPos::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignId('prod_order_pos_op_plan_pos_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->boolean('is_ok')->default(false);
            $table->string('name')->nullable();
            $table->string('specification')->nullable();
            $table->string('issue_revision_status')->nullable();
            $table->string('quality_class')->nullable();
            $table->string('test_scope')->nullable();
            $table->string('test_equipment')->nullable();
            $table->string('test_temperature')->nullable();
            $table->string('developer')->nullable();
            $table->string('penetrant')->nullable();
            $table->string('intermediate_cleaner')->nullable();
            $table->string('illuminance_lux')->nullable();
            $table->string('cleaner')->nullable();
            $table->string('registration_limit')->nullable();
            $table->string('control_unit')->nullable();
            $table->string('comments')->nullable();
            $table->string('lux_meter')->nullable();
            $table->string('batch_developer')->nullable();
            $table->string('batch_penetrant')->nullable();
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
        Schema::dropIfExists('hwe_qs_pt_norms');
    }
};
