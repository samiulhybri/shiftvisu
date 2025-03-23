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
        Schema::table('delivery_terms', function (Blueprint $table) {
            $table->string('crm_id')->nullable();
            $table->boolean('has_delivery_cost')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('delivery_terms', function (Blueprint $table) {
            $table->dropColumn(['crm_id', 'has_delivery_cost']);
        });
    }
};
