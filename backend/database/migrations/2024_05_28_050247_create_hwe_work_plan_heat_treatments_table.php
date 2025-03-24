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
        Schema::create('hwe_work_plan_heat_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HweWorkPlan::class)->constrained()->cascadeOnDelete();
            $table->integer('pos');
            $table->string('type');
            $table->string('internal_note')->nullable();
            $table->unique(['hwe_work_plan_id','pos','type']);
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
        Schema::dropIfExists('hwe_work_plan_heat_treatments');
    }
};
