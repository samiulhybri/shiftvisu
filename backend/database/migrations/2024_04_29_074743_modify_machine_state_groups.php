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
        Schema::table('machine_state_groups', function (Blueprint $table) {
            $table->boolean('is_productive')->default(false);
            $table->boolean('has_capacity')->default(true);
            $table->string('color', 6)->default('000000');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('machine_state_groups', function (Blueprint $table) {
            $table->dropColumn([
                'is_productive',
                'has_capacity',
                'color'
            ]);
        });
    }
};
