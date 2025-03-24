<?php

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
        Schema::create('cost_center_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\CostCenter::class)->nullable()->constrained()->nullOnDelete();
            $table->double('cost')->default(0);
            $table->string('cost_type')->nullable();
            $table->date('valid_from')->nullable();
            $table->date('valid_to')->nullable();
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
        Schema::dropIfExists('cost_center_costs');
    }
};
