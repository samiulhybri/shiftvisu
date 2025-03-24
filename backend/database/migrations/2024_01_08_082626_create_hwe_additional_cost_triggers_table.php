<?php

use App\Models\HweAdditionalCost;
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
        Schema::create('hwe_additional_cost_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HweAdditionalCost::class)->constrained()->cascadeOnDelete();
            $table->string('trigger');
            $table->index(['hwe_additional_cost_id', 'trigger'],'index_hwe_additional_cost_triggers');
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
        Schema::dropIfExists('hwe_additional_cost_triggers');
    }
};
