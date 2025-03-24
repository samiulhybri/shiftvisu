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
        Schema::create('mp_offers', function (Blueprint $table) {
            $table->id();
            $table->string("custom_id")->unique()->nullable();
            $table->date("date")->nullable();
            $table->foreignId("customer_id")->nullable()->constrained()->references("id")->on("customers")->cascadeOnDelete();
            $table->foreignId("final_customer_id")->nullable()->constrained()->references("id")->on("customers")->cascadeOnDelete();
            $table->string("tool_type")->nullable();
            $table->string('name')->nullable();
            $table->boolean('is_closed')->default(false)->nullable();
            $table->string('construction_type')->nullable();
            $table->double('press_weight')->default(0)->nullable();
            $table->double('quantity_imprint')->default(0)->nullable();
            $table->double('max_length')->default(0)->nullable();
            $table->double('max_width')->default(0)->nullable();
            $table->double('max_height')->default(0)->nullable();
            $table->double('weight')->default(0)->nullable();
            $table->double('length')->default(0)->nullable();
            $table->double('width')->default(0)->nullable();
            $table->double('height')->default(0)->nullable();
            $table->double('size')->default(0)->nullable();
            $table->double('projected_area')->default(0)->nullable();
            $table->double('imprint_volume')->default(0)->nullable();
            $table->string('material')->nullable();
            $table->double('shots_guaranteed')->default(0)->nullable();
            $table->string('finishing_visible')->nullable();
            $table->string('finishing_not_visible')->nullable();
            $table->string('injection_type')->nullable();
            $table->double('nozzle_quantity')->default(0)->nullable();
            $table->string('nozzle_type')->nullable();
            $table->string('rubber_injection')->nullable();
            $table->boolean('has_movements')->default(false)->nullable();
            $table->double('movements_mechanic')->default(0)->nullable();
            $table->double('movements_hydraulic')->default(0)->nullable();
            $table->double('rods')->default(0)->nullable();
            $table->double('jowls')->default(0)->nullable();
            $table->double('unscrewing')->default(0)->nullable();
            $table->boolean('has_third_plate')->default(false)->nullable();
            $table->boolean('has_double_extraction')->default(false)->nullable();
            $table->string('extraction_type')->nullable();
            $table->boolean('is_rounded_extractor')->default(false)->nullable();
            $table->boolean('is_tear_extractor')->default(false)->nullable();
            $table->boolean('is_tubular_extractor')->default(false)->nullable();
            $table->boolean('is_square_extractor')->default(false)->nullable();
            $table->boolean('is_extraction_help_fixed')->default(false)->nullable();
            $table->boolean('is_hydraulic_extraction_fixed')->default(false)->nullable();
            $table->boolean('has_laths_rings')->default(false)->nullable();
            $table->double('surplus_material')->default(0)->nullable();
            $table->double('surplus_external')->default(0)->nullable();
            $table->double('surplus_internal')->default(0)->nullable();
            $table->double('surplus_total')->default(0)->nullable();
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
        Schema::dropIfExists('mp_offers');
    }
};
