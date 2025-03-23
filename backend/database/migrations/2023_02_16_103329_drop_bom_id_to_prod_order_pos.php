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
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropForeign(['bom_id']);
            $table->dropColumn('bom_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->foreignId('bom_id')->nullable()->constrained()->nullOnDelete();
        });
    }
};
