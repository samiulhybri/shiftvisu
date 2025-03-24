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
            $table->foreignIdFor(MpOffer::class, 'parent_offer_id')->nullable()->constrained('mp_offers')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->dropConstrainedForeignIdFor(MpOffer::class, 'parent_offer_id');
        });
    }
};
