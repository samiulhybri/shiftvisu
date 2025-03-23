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
        Schema::table('machines', function (Blueprint $table) {
            $table->string('just_plan_it_guid')->nullable();
        });

        Schema::table('machine_groups', function (Blueprint $table) {
            $table->string('just_plan_it_guid')->nullable();
        });

        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->string('just_plan_it_guid')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machines', function (Blueprint $table) {
            $table->dropColumn('just_plan_it_guid');
        });

        Schema::table('machine_groups', function (Blueprint $table) {
            $table->dropColumn('just_plan_it_guid');
        });

        Schema::table('prod_order_pos', function (Blueprint $table) {
            $table->dropColumn('just_plan_it_guid');
        });
    }
};
