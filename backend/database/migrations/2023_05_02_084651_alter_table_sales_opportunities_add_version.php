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
        Schema::table('sales_opportunities', function (Blueprint $table) {
            $table->integer('version')->nullable();
            $table->string('phase')->nullable();
            $table->string('status')->nullable();
            $table->unique(['custom_id', 'version'], 'alternative_unique');
            $table->dropUnique('sales_opportunities_custom_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('sales_opportunities', function (Blueprint $table) {
            $table->dropUnique('alternative_unique');
            $table->unique('custom_id');
            $table->dropColumn(['version', 'phase', 'status']);
        });
    }
};
