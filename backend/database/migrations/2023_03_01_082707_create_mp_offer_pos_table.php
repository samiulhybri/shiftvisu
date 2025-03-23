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
        Schema::create('mp_offer_pos', function (Blueprint $table) {
            $table->id();
            $table->foreignId("mp_offer_id")->nullable()->constrained()->references("id")->on("mp_offers")->cascadeOnDelete();
            $table->foreignId("mp_costs_id")->nullable()->constrained()->references("id")->on("mp_costs")->cascadeOnDelete();
            $table->string("cost_group")->nullable();
            $table->string("cost_sub_group")->nullable();
            $table->string("cost_type")->nullable();
            $table->string("name")->nullable();
            $table->double("length")->nullable();
            $table->double("width")->nullable();
            $table->double("height")->nullable();
            $table->foreignId("mp_material_id")->nullable()->constrained()->references("id")->on("mp_materials")->cascadeOnDelete();
            $table->double("price")->nullable();
            $table->double("total")->nullable();
            $table->double("density")->nullable();
            $table->double("quantity")->nullable();
            $table->string("supplier_offer_id")->nullable();
            $table->string("supplier_name")->nullable();
            $table->string("supplier_offer_date")->nullable();
            $table->foreignId("machine_id")->nullable()->constrained()->references("id")->on("machines")->cascadeOnDelete();
            $table->double("machine_quantity")->nullable();
            $table->double("machine_price")->nullable();
            $table->double("personnel_quantity")->nullable();
            $table->double("personnel_price")->nullable();
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
        Schema::dropIfExists('mp_offer_pos');
    }
};
