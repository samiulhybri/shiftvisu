<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->dropColumn(['version']);
        });

        Schema::table('mp_offers', function (Blueprint $table) {
            $table->longText('note')->nullable()->change();
            $table->integer('version')->default(1)->nullable();

            $table->unique(['custom_id', 'version'], 'mp_offers_unique_index');
            $table->dropUnique('mp_offers_custom_id_unique');
        });

        Schema::table('mp_offer_pos', function (Blueprint $table) {
            $table->string('note')->nullable();
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
            $table->string('note')->change();
            $table->string('version')->change();

            $table->unique('custom_id');
            $table->dropUnique('mp_offers_unique_index');
        });

        Schema::table('mp_offer_pos', function (Blueprint $table) {
            $table->dropColumn('note');
        });
    }
};
