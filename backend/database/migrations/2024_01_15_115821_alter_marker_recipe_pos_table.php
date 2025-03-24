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
        Schema::table('marker_recipe_pos', function (Blueprint $table) {
            $table->integer('pos')->nullable()->change();
            $connection = Schema::getConnection()->getDriverName();
            if ($connection == 'pgsql') {
                DB::statement('ALTER TABLE marker_recipe_pos ALTER COLUMN pos TYPE INTEGER USING (pos::integer)');
            }
            $table->dropColumn(['font', 'font_width', 'font_space']);
            $table->integer('font_height')->nullable()->default(0)->change();
            $table->integer('pos_x')->nullable()->default(0)->change();
            $table->integer('pos_y')->nullable()->default(0)->change();
            $table->integer('pos_z')->nullable()->default(0)->change();
            $table->integer('angle')->nullable()->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('marker_recipe_pos', function (Blueprint $table) {
            $table->string('pos')->nullable(false)->change();
            $table->double('font_width')->nullable();
            $table->double('font_space')->nullable();
            $table->double('font_height')->change();
            $table->double('pos_x')->change();
            $table->double('pos_y')->change();
            $table->double('pos_z')->change();
            $table->double('angle')->change();
        });
    }
};
