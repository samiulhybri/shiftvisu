<?php

use App\Models\Material;
use App\Models\OfferPos;
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
        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
        });

        OfferPos::whereNull('material_id')->update(['material_id' => Material::first()?->id]);
        OfferPos::whereNull('product_type')->update(['product_type' => '']);
        OfferPos::whereNull('quantity')->update(['quantity' => 0]);
        OfferPos::whereNull('delivery_state')->update(['delivery_state' => '']);

        Schema::table('offer_pos', function (Blueprint $table) {
            $table->string('product_type')->nullable(false)->change();
            $table->integer('quantity')->nullable(false)->change();
            $table->string('delivery_state')->nullable(false)->change();
            $table->unsignedBigInteger('material_id')->nullable(false)->change();
            $table->foreign('material_id')->references('id')->on('materials');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        Schema::table('offer_pos', function (Blueprint $table) {

        });

        Schema::table('offer_pos', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->string('product_type')->nullable()->change();
            $table->integer('quantity')->nullable()->change();
            $table->string('delivery_state')->nullable()->change();
            $table->unsignedBigInteger('material_id')->nullable()->change();
            $table->foreign('material_id')->references('id')->on('materials');
        });

    }
};