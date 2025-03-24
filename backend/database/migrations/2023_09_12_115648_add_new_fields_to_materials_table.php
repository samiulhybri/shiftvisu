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
        Schema::table('materials', function (Blueprint $table) {
            $table->double('density')->nullable();
            $table->string('material_group_type')->nullable();
            $table->string('requested_material')->nullable();
            $table->string('warehouse_material')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('materials', function (Blueprint $table) {
            $table->dropColumn('density');
            $table->dropColumn('material_group_type');
            $table->dropColumn('requested_material');
            $table->dropColumn('warehouse_material');
        });
    }
};
