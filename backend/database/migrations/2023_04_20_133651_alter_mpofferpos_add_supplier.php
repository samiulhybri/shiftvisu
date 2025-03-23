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
        Schema::table('mp_offer_pos', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->constrained();
            $table->dropColumn('supplier_name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mp_offer_pos', function (Blueprint $table) {
            $table->dropForeign('mp_offer_pos_supplier_id_foreign');
            $table->dropColumn('supplier_id');
            $table->string('supplier_name')->nullable();
        });
    }
};
