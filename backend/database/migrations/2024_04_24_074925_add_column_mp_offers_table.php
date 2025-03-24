<?php

use App\Models\MpOffer;
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
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->double('surplus_internal_personnel')->default(0)->nullable();
            $table->double('surplus_internal_machine')->default(0)->nullable();
        });

        $offers = MpOffer::all();
        foreach($offers as $offer) {
            $offer->update([
                'surplus_internal_personnel' => ($offer->getSurplusInternal() / 100),
                'surplus_internal_machine' => ($offer->getSurplusInternal() / 100)
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->dropColumn(['surplus_internal_personnel', 'surplus_internal_machine']);
        });
    }
};
