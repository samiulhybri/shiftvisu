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
        Schema::table('mp_offers', function (Blueprint $table) {
            $table->string('version')->nullable();
            $table->string('mp_offer_type')->nullable();
            $table->string('quantity_imprint')->default('0')->nullable()->change();
            $table->string('injection_type_2')->nullable();
            $table->double('nozzle_quantity_2')->default(0)->nullable();
            $table->string('nozzle_type_2')->nullable();
            $table->string('injection_note')->nullable();
            $table->string('note')->nullable();
        });

        Schema::table('mp_offer_pos', function (Blueprint $table) {
            $table->string('mouldflow_type')->nullable();
            $table->string('pf_pm_type')->nullable();
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
            $table->dropColumn(['quantity_imprint']);
        }); 

        Schema::table('mp_offers', function (Blueprint $table) {
            $table->dropColumn(['version','mp_offer_type', 'injection_type_2', 'nozzle_quantity_2', 'nozzle_type_2', 'injection_note', 'note']);
            $table->double('quantity_imprint');
        });

        Schema::table('mp_offer_pos', function (Blueprint $table) {
            $table->dropColumn('mouldflow_type', 'pf_pm_type');
        });
    }
};
