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
        Schema::table('offer_pos_costs', function (Blueprint $table) {
            $table->double('quantity')->nullable();
            $table->double('factor')->nullable()->default(1);
            $table->double('price')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('offer_pos_costs', function (Blueprint $table) {
            $table->dropColumn(['quantity', 'factor', 'price']);
        });
    }
};
