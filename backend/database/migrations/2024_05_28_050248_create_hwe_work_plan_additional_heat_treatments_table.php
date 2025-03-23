<?php

use App\Models\HweWorkPlan;
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
        Schema::create('hwe_work_plan_additional_heat_treatments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('hwe_work_plan_id');
            $table->foreign('hwe_work_plan_id', 'hwe_work_plan_add_treat_hwe_work_plan_id_foreign')
                ->references('id')
                ->on('hwe_work_plans')
                ->cascadeOnDelete();
            $table->integer('pos');
            $table->string('type');
            $table->unique(['hwe_work_plan_id','pos','type'], 'hwe_work_plan_id_pos_type_unique');
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
        Schema::dropIfExists('hwe_work_plan_additional_heat_treatments');
    }
};
