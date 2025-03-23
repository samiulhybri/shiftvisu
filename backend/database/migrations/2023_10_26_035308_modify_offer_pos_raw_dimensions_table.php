<?php

use App\Models\Item;
use App\Models\OfferPosRawDimension;
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

        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropForeign(['item_id']);
        });

        OfferPosRawDimension::whereNull('gross_weight')->update(['gross_weight' => 0.0]);
        OfferPosRawDimension::whereNull('item_id')->update(['item_id' => Item::first()?->id]);

        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->double('gross_weight')->nullable(false)->change();
            $table->unsignedBigInteger('item_id')->nullable(false)->change();
            $table->foreign('item_id')->references('id')->on('items');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->dropForeign(['item_id']);
            $table->double('gross_weight')->nullable()->change();
            $table->unsignedBigInteger('item_id')->nullable()->change();
            $table->foreign('item_id')->references('id')->on('items');
        });


    }
};
