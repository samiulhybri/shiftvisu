<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        Schema::table('marker_recipe_pos_blocks', function (Blueprint $table) {
            $table->string('date_time_format_string')->nullable()->change();
            $table->string('text')->nullable()->change();
            $table->integer('ascii_dec')->nullable()->change();
            $table->integer('shot_counter_length')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('marker_recipe_pos_blocks')->whereNull('date_time_format_string')->update(['date_time_format_string' => '']);
        DB::table('marker_recipe_pos_blocks')->whereNull('text')->update(['text' => '']);
        DB::table('marker_recipe_pos_blocks')->whereNull('ascii_dec')->update(['ascii_dec' => 0]);
        DB::table('marker_recipe_pos_blocks')->whereNull('shot_counter_length')->update(['shot_counter_length' => 0]);
        Schema::table('marker_recipe_pos_blocks', function (Blueprint $table) {
            $table->string('date_time_format_string')->nullable(false)->change();
            $table->string('text')->nullable(false)->change();
            $table->integer('ascii_dec')->nullable(false)->change();
            $table->integer('shot_counter_length')->nullable(false)->change();
        });
    }
};
