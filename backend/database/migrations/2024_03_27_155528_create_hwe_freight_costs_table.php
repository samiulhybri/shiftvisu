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
        Schema::create('hwe_freight_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(\App\Models\Country::class)->constrained()->cascadeOnDelete();
            $table->string('postal_code_from');
            $table->string('postal_code_to');
            $table->double('delivery_weight_from')->default(0);
            $table->double('delivery_weight_to')->default(0);
            $table->double('price')->default(0);
            $table->unique(['country_id', 'postal_code_from', 'postal_code_to', 'delivery_weight_from', 'delivery_weight_to'], 'hwe_freight_costs_unique');
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
        Schema::dropIfExists('hwe_freight_costs');
    }
};
