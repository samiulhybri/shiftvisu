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
        Schema::table('prod_orders', function (Blueprint $table) {
            $table->string('assembly')->nullable()->after('custom_id');
            $table->date('due_date')->nullable()->after('assembly');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('prod_orders', function (Blueprint $table) {
            $table->dropColumn('assembly');
            $table->dropColumn('due_date');
        });
    }
};
