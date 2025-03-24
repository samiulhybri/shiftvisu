<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\HwePackagingCost;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hwe_packaging_cost_product_types', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(HwePackagingCost::class)->constrained()->cascadeOnDelete();
            $table->string('product_type');
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
        Schema::dropIfExists('hwe_packaging_cost_product_types');
    }
};
