<?php

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
        OfferPosRawDimension::whereNull('operating_weight')->update(['operating_weight' => 0.0]);

        Schema::table('offer_pos_raw_dimensions', function (Blueprint $table) {
            $table->string('rolling_pin')->nullable();
            $table->double('gross_weight')->nullable()->change();
            $table->double('operating_weight')->nullable(false)->change();
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
            $table->dropColumn('rolling_pin');
            $table->double('gross_weight')->nullable(false)->change();
            $table->double('operating_weight')->nullable()->change();
        });
    }
};
