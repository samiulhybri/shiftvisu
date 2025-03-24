<?php

use App\Models\Item;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('item_unit_of_measure_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Item::class)->constrained();
            $table->foreignIdFor(UnitOfMeasure::class)->constrained();
            $table->integer('quantity_denominator');
            $table->integer('quantity_numerator');
            $table->timestamps();

            $table->unique(['item_id', 'unit_of_measure_id'], 'item_unit_of_measure_conversions_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_unit_of_measure_conversions');
    }
};
